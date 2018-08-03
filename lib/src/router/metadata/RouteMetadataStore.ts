import { ControllerConfig, UserControllerConfig } from "../types/ControllerConfig";
import { SOCKET_CONTROLLER_METADATA_KEY } from "../../decorator/SocketController";
import { RouteConfig, UserRouteConfig } from "../types/RouteConfig";
import { SOCKET_ROUTE_METADATA_KEY } from "../../decorator/SocketRoute";
import { Route, RouteReturn } from "../Route";
import { ExecutionContext } from "../../config/ExecutionContext";
import { ConsoleLogger } from "../..";
import { container } from "../../di/SRocketContainer";
import { rightPad } from "../../utility/pads";
import { Metadata } from "../../utility/Metadata";
import { Newable } from "../../structures/Newable";

import {
	InternalRoute,
	FunctionalInternalRoute,
	ClassInternalRoute,
	ObjectInternalRoute,
	ControllerMetaInternalRoute
} from "../../router/InternalRoute";

export enum RouteType {
	ClassBased = "class",
	ObjectBased = "object",
	FunctionBased = "functional"
}

export class ControllerMetadata {
	public messageRoutes: RouteMetadata[];
	public connectHandlers: ControllerMetaInternalRoute[];
	public disconnectHandlers: ControllerMetaInternalRoute[];

	public config: ControllerConfig;

	constructor() {
		this.messageRoutes = [];
		this.connectHandlers = [];
		this.disconnectHandlers = [];
	}

	public addConnectHandler(handler: ControllerMetaInternalRoute) {
		this.connectHandlers.push(handler);
	}

	public addDisconnectHandler(handler: ControllerMetaInternalRoute) {
		this.disconnectHandlers.push(handler);
	}

	public addMessageRoute(route: RouteMetadata) {
		this.messageRoutes.push(route);
	}
}

export interface RouteDefinition {
	controller: Controller;
	route: Route;
	property: string;
}

export class RouteMetadata {
	public handler: InternalRoute<Route>;
	public config: RouteConfig;
	public definition: RouteDefinition;

	constructor(handler: InternalRoute<Route>, definition: RouteDefinition, config: RouteConfig) {
		this.definition = definition;
		this.handler = handler;
		this.config = config;
	}
}

export abstract class Controller {
	$onConnect?(socket: SocketIO.Socket): RouteReturn;
	$onDisconnect?(socket: SocketIO.Socket): RouteReturn;
}

export class RouteMetadataStore {
	public controllers: ControllerMetadata[];

	protected logger: ConsoleLogger;

	constructor() {
		this.controllers = [];
		this.logger = new ConsoleLogger("Route-Store");
	}

	public buildController(controller: Newable<Controller>) {
		this.logger.info(`Registering Controller: ${controller.name}`);

		const controllerMetadata = new ControllerMetadata();
		const instance = new controller();

		RouteMetadataStore.buildControllerConfigFromDecorator(controller, controllerMetadata);
		this.getControllerMetaRoutes(instance, controllerMetadata);

		const properties = [
			...Object.getOwnPropertyNames(instance),
			...Object.getOwnPropertyNames(controller.prototype)
		];

		for (const property of properties) {
			if (RouteMetadataStore.hasValidRouteMetadata(instance, property)) {
				const indexableInstance = instance as typeof instance & { [index: string]: any };
				this.buildRoute(
					controllerMetadata,
					indexableInstance[property],
					RouteMetadataStore.buildRouteConfigFromDecorator(instance, property),
					instance,
					property
				);
			}
		}

		this.addController(controllerMetadata);
	}

	public buildRoute(
		controllerMetadata: ControllerMetadata,
		route: Route,
		config: RouteConfig,
		controller: Controller,
		property: string
	) {
		const routeType = RouteMetadataStore.findRouteType(route);

		this.logger.info(`\t${rightPad(routeType, 10)} : ${config.path}`);

		let internalRoute: InternalRoute<Route>;
		switch (routeType) {
			case RouteType.ClassBased:
				internalRoute = new ClassInternalRoute(route as any, config);
				break;
			case RouteType.FunctionBased:
				internalRoute = new FunctionalInternalRoute(route as any, config);
				break;
			case RouteType.ObjectBased:
				internalRoute = new ObjectInternalRoute(route as any, config);
				break;
			default:
				throw new Error("Tried to register unknown Route type!");
		}

		config.path = RouteMetadataStore.getRouteName(
			[controllerMetadata.config.prefix],
			config.path
		);

		const routeMetadata = new RouteMetadata(
			internalRoute,
			{ route, property, controller },
			config
		);

		controllerMetadata.addMessageRoute(routeMetadata);
	}

	protected addController(metadata: ControllerMetadata) {
		this.controllers.push(metadata);
	}

	protected getControllerMetaRoutes(controller: Controller, metadata: ControllerMetadata) {
		if (controller.$onConnect) {
			this.logger.info("\t$connect Handler!");
			metadata.addConnectHandler(new ControllerMetaInternalRoute(controller.$onConnect));
		}

		if (controller.$onDisconnect) {
			this.logger.info("\t$disconnect Handler!");
			metadata.addDisconnectHandler(
				new ControllerMetaInternalRoute(controller.$onDisconnect)
			);
		}
	}

	protected static buildControllerConfigFromDecorator(
		controller: Newable<Controller>,
		metadata: ControllerMetadata
	) {
		const userControllerConfig: UserControllerConfig = RouteMetadataStore.getControllerMetadata(
			controller
		);

		if (!userControllerConfig) return;

		metadata.config = {
			prefix: userControllerConfig.prefix || "",
			namespace: userControllerConfig.namespace || "/",
			beforeMiddleware: userControllerConfig.beforeMiddleware || [],
			afterMiddleware: userControllerConfig.afterMiddleware || [],
			/**
			 * We need to spread the rest of the properties of the user supplied config
			 * to make plugins/middleware config easier. The userControllerConfig has a
			 * indexer added so that middleware authors can add their own config.
			 *
			 * To give them access to that information, we add those "misc" props here.
			 */
			...userControllerConfig
		};
	}

	protected static buildRouteConfigFromDecorator(
		controller: Controller,
		property: string
	): RouteConfig {
		const userConfig: UserRouteConfig = RouteMetadataStore.getRouteMetadata(
			controller,
			property
		);

		return {
			path: userConfig.path || property,
			beforeMiddleware: userConfig.beforeMiddleware || [],
			afterMiddleware: userConfig.afterMiddleware || [],
			/**
			 * We need to spread the rest of the properties of the user supplied config
			 * to make plugins/middleware config easier. The userConfig has a
			 * indexer added so that middleware authors can add their own config.
			 *
			 * To give them access to that information, we add those "misc" props here.
			 */
			...userConfig
		};
	}

	protected static getRouteName(prefixes: string[], routeName: string) {
		const notEmptyPrefixes = prefixes.filter(prefix => prefix !== "");

		if (notEmptyPrefixes.length === 0) {
			return routeName;
		}

		const separator = container.get(ExecutionContext).separationConvention;
		let result = "";

		for (const prefix of notEmptyPrefixes) {
			result += `${prefix}${separator}`;
		}

		return (result += routeName);
	}

	protected static getControllerMetadata(target: Newable<Controller>) {
		const metadata = Metadata.getClassDecorator(SOCKET_CONTROLLER_METADATA_KEY, target);
		return metadata;
	}

	protected static getRouteMetadata(target: any, property?: string) {
		const metadata = property
			? Metadata.getPropertyDecorator(SOCKET_ROUTE_METADATA_KEY, target, property)
			: Metadata.getClassDecorator(SOCKET_ROUTE_METADATA_KEY, target);

		return metadata;
	}

	protected static hasValidRouteMetadata(target: any, property?: string) {
		const metadata = RouteMetadataStore.getRouteMetadata(target, property);
		return metadata !== null && metadata !== undefined;
	}

	protected static findRouteType(target: any, property?: string): RouteType {
		if (property) target = target[property];

		if (typeof target === "object") {
			return RouteType.ObjectBased;
		} else if (typeof target === "function") {
			if (target.prototype && typeof target.prototype.on === "function") {
				return RouteType.ClassBased;
			} else {
				return RouteType.FunctionBased;
			}
		} else {
			throw new Error(
				"Tried to register something as a Route that is nor a object nor a function or a class/object with a 'on' function!"
			);
		}
	}
}
