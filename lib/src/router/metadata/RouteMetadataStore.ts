import { SOCKET_CONTROLLER_METADATA_KEY } from "../../decorator/SocketController";
import { RouteConfig, UserRouteConfig } from "../types/RouteConfig";
import { SOCKET_ROUTE_METADATA_KEY } from "../../decorator/SocketRoute";
import { RuntimeConfiguration } from "../../config/RuntimeConfiguration";
import { UserControllerConfig } from "../types/ControllerConfig";
import { ControllerMetadata } from "./ControllerMetadata";
import { RouteDefinition } from "./RouteDefinition";
import { RouteMetadata } from "./RouteMetadata";
import { ConsoleLogger } from "../..";
import { Controller } from "../Controller";
import { container } from "../../di/SRocketContainer";
import { rightPad } from "../../utility/StringPad";
import { Metadata } from "../../utility/Metadata";
import { Newable } from "../../structures/Newable";
import { Route } from "../Route";

import {
	InternalRoute,
	ControllerMetaInternalRoute,
	FunctionalInternalRoute,
	ObjectInternalRoute,
	ClassInternalRoute
} from "../InternalRoute";

enum RouteType {
	ClassBased = "class",
	ObjectBased = "object",
	FunctionBased = "functional"
}

export class RouteMetadataStore {
	protected controllers: ControllerMetadata[];
	protected logger: ConsoleLogger;

	constructor() {
		this.controllers = [];
		this.logger = new ConsoleLogger("Route-Store");
	}

	public getControllers() {
		return this.controllers;
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
				const route = indexableInstance[property];
				this.buildRoute(
					controllerMetadata,
					route,
					RouteMetadataStore.buildRouteConfigFromDecorator(instance, property),
					{ controller: instance, property, route }
				);
			}
		}

		this.addController(controllerMetadata);
	}

	public buildRoute(
		controllerMetadata: ControllerMetadata,
		route: Route,
		config: RouteConfig,
		definition: RouteDefinition
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

		const routeMetadata = new RouteMetadata(internalRoute, definition, config);
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

		metadata.config = {
			// "" is the default prefix
			prefix: userControllerConfig.prefix || "",
			// "/" is the default namespace
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

		const separator = container.get(RuntimeConfiguration).separationConvention;
		let result = "";

		for (const prefix of notEmptyPrefixes) {
			result += `${prefix}${separator}`;
		}

		return (result += routeName);
	}

	protected static getControllerMetadata(target: Newable<Controller>) {
		return Metadata.getClassDecorator(SOCKET_CONTROLLER_METADATA_KEY, target);
	}

	protected static getRouteMetadata(target: any, property?: string) {
		return property
			? Metadata.getPropertyDecorator(SOCKET_ROUTE_METADATA_KEY, target, property)
			: Metadata.getClassDecorator(SOCKET_ROUTE_METADATA_KEY, target);
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
