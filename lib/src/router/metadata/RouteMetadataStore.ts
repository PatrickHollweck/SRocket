import { Newable } from "../../structures/Newable";
import { Metadata } from "../../utility/Metadata";
import { RouteConfig } from "../RouteConfig";
import { ConsoleLogger } from "../..";
import { SOCKET_ROUTE_METADATA_KEY } from "../../decorator/SocketRoute";
import { InternalRoute, FunctionalInternalRoute, ClassInternalRoute, ObjectInternalRoute } from "../../router/InternalRoute";

import * as rightPad from "right-pad";

export type RouteReturn = Promise<void> | void;

export interface ObjectRoute {
	on(): RouteReturn;
	onError(e: Error): RouteReturn;
}

export type FunctionalRoute = () => Promise<void> | void;

export type Route = ObjectRoute | FunctionalRoute;

export class RouteMetadata {
	public handler: InternalRoute<Route>;
	public name: string;

	constructor(handler: InternalRoute<Route>, name: string) {
		this.handler = handler;
		this.name = name;
	}
}

export enum RouteType {
	classBased = "class",
	objectBased = "object",
	functionBased = "functional"
}

export class ControllerMetadata {
	public routes: RouteMetadata[];
	public namespace: string;

	constructor() {
		this.namespace = "/";
		this.routes = [];
	}
}

export class Controller {}

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

		const properties = [...Object.getOwnPropertyNames(instance), ...Object.getOwnPropertyNames(controller.prototype)];

		for (const property of properties) {
			if (RouteMetadataStore.hasValidRouteMetadata(instance, property)) {
				this.buildRoute(controllerMetadata, instance[property], property);
			}
		}

		this.controllers.push(controllerMetadata);
	}

	public buildRoute(controllerMetadata: ControllerMetadata, route: Route, routeName: string) {
		const routeType = RouteMetadataStore.findRouteType(route);

		this.logger.info(`\t${rightPad(routeType, 10)} : ${routeName}`);

		let internalRoute: InternalRoute<Route>;
		switch (routeType) {
			case RouteType.classBased:
				internalRoute = new ClassInternalRoute(route as any);
				break;
			case RouteType.functionBased:
				internalRoute = new FunctionalInternalRoute(route as any);
				break;
			case RouteType.objectBased:
				internalRoute = new ObjectInternalRoute(route as any);
				break;
			default:
				throw new Error("Tried to register unknown Route type!");
		}

		const routeMetadata = new RouteMetadata(internalRoute, routeName);

		controllerMetadata.routes.push(routeMetadata);
	}

	protected static getRouteMetadata(target: any, property?: string): RouteConfig {
		const metadata: RouteConfig = property
			? Metadata.getPropertyDecorator(SOCKET_ROUTE_METADATA_KEY, target, property)
			: Metadata.getClassDecorator(SOCKET_ROUTE_METADATA_KEY, target);

		if (!metadata) throw new Error("Tried to register a class Route with no decorator");

		return metadata;
	}

	protected static hasValidRouteMetadata(target: any, property?: string) {
		// TODO: Poor mans implementation
		try {
			RouteMetadataStore.getRouteMetadata(target, property);
			return true;
		} catch (error) {
			return false;
		}
	}

	protected static findRouteType(target: any, property?: string): RouteType {
		if (property) target = target[property];

		if (typeof target === "object") {
			return RouteType.objectBased;
		} else if (typeof target === "function") {
			if (target.prototype && typeof target.prototype.on === "function") {
				return RouteType.classBased;
			} else {
				return RouteType.functionBased;
			}
		} else {
			throw new Error("Tried to register something as a Route that is nor a object nor a function or a class/object with a 'on' function!");
		}
	}
}
