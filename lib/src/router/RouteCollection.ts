import {
	InternalClassRoute,
	InternalFunctionalRoute,
	InternalObjectRoute,
	InternalRoute,
	RouteType
} from "./InternalRoute";

import { FunctionalRoute, NestedRoute, Route } from "./Route";
import { ConsoleLogger, Logger } from "../logging";
import { routeMetadataKey } from "../decorator/SocketRoute";
import { SocketPacket } from "../structures/SocketPacket";
import { RouteConfig } from "./RouteConfig";
import { Controller } from "./Controller";
import { Metadata } from "../utility";
import { Newable } from "../structures/Newable";
import { inject } from "../DI/SRocketContainer";
import { Config } from "../config";

export class RouteCollection {
	@inject(Config) protected config: Config;
	protected routes: InternalRoute[];
	protected logger: Logger;

	constructor() {
		this.logger = new ConsoleLogger("RouterC");
		this.routes = [];
	}

	public findForPacket(packet: SocketPacket) {
		return this.routes.find(internalRoute => internalRoute.getRoutePath() === packet.getRoutePath());
	}
	
	public find(route: string) {
		return this.routes.find(internalRoute => internalRoute.getRoutePath() === route);
	}

	public controller(namespaces: string[], ...controllers: Newable<Controller>[]) {
		for (const controller of controllers) {
			const instance = new controller();
			for (const property in instance) {
				if(RouteCollection.hasValidRouteMetadata(instance, property)) {
					switch(RouteCollection.getRouteType(instance[property])) {
						case RouteType.objectBased:
							this.registerObject(instance, namespaces, property);
							break;
						case RouteType.functionBased:
							this.registerFunctional(instance, namespaces, property);
							break;
						case RouteType.classBased:
							this.registerClass(instance, namespaces, property);
							break;
					}
				}
			}
		}
	}

	public registerClass(target: any, namespaces: string[], property?: string, config?: RouteConfig) {
		const metadata = config || RouteCollection.getRouteMetadata(target, property);
		const instance: Route = RouteCollection.getRouteInstance(target, property);

		this.concatNamespace(metadata, namespaces);
		const internalRoute = new InternalClassRoute(metadata, instance);

		this.addRoute(internalRoute);

		// TODO: Classes should not have the nested property but we should scan for route like objects in the parent route.
		if(instance.nested) {
			for(const nestedProperty in instance.nested) {
				this.registerNestedObject(instance.nested[nestedProperty], instance, [...namespaces, property || ""], nestedProperty);
			}
		}
	}

	public registerFunctional(target: any, namespaces: string[], property?: string) {
		const metadata = RouteCollection.getRouteMetadata(target, property);
		const instance: FunctionalRoute = RouteCollection.getRouteInstance(target, property);
	
		this.concatNamespace(metadata, namespaces);
		const internalRoute = new InternalFunctionalRoute(metadata, instance);
		
		this.addRoute(internalRoute);
	}
	
	public registerObject(target: any, namespaces: string[], property?: string, config?: RouteConfig) {
		const metadata = config || RouteCollection.getRouteMetadata(target, property);
		const instance: Route = RouteCollection.getRouteInstance(target, property);

		this.concatNamespace(metadata, namespaces);
		const internalRoute = new InternalObjectRoute(metadata, instance);
		
		this.addRoute(internalRoute);

		if(instance.nested) {
			for(const nestedProperty in instance.nested) {
				this.registerNestedObject(instance.nested[nestedProperty], instance, [...namespaces, property || ""], nestedProperty);
			}
		}
	}

	public registerNestedObject(target: NestedRoute, parentRoute: Route, namespaces: string[], property: string) {
		if(!target.config) target.config = { path: property };

		const metadata: RouteConfig = target.config || { path: property };
		this.registerObject(parentRoute.nested, namespaces, property, metadata);
	}
	
	protected static getRouteInstance(target: any, property?: string) {
		const routeType = this.getRouteType(target, property);
		switch(routeType) {
			case RouteType.functionBased:
			case RouteType.objectBased:
				if(property) {
					return target[property];
				} else {
					return target;
				}
			case RouteType.classBased:
				if(property) {
					return new target[property]();
				} else {
					return new target();
				}
		} 
	}
	
	protected static getRouteMetadata(target: any, property?: string): RouteConfig {
		let metadata: RouteConfig;
		if(property) {
			metadata = Metadata.getPropertyDecorator(routeMetadataKey, target, property);
		} else {
			metadata = Metadata.getClassDecorator(routeMetadataKey, target);
		}

		if(!metadata) throw new Error("Tried to register a class Route with no decorator");
		
		return metadata;
	}
	
	public static getRouteType(target: any, property?: string): RouteType {
		if(property) target = target[property];
		
		if(typeof target === "object") {
			return RouteType.objectBased;
		} else if(typeof target === "function") {	
			if(typeof target.prototype.on === "function") {
				return RouteType.classBased;
			} else {
				return RouteType.functionBased;
			}
		} else {
			throw new Error("Tried to register something as a Route that is nor a object nor a function or a class without a 'on' function!");
		}
	}
	
	protected static hasValidRouteMetadata(target: any, property?: string) {
		try {
			RouteCollection.getRouteMetadata(target, property);
			return true;
		} catch(error) {
			return false;
		}
	}
	
	protected concatNamespace(route: RouteConfig, namespaces: string[]) {
		let completeNamespace = "";
		for(const namespace of namespaces) {
			completeNamespace += `${namespace}${this.config.seperationConvention}`;
		}

		route.path = `${completeNamespace}${route.path}`;
	}

	protected addRoute(route: InternalRoute) {
		this.logger.info(`Registering Route: ${route.getRoutePath()}`);
		this.routes.push(route);
	}
}
