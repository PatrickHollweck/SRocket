import {
	InternalClassRoute,
	InternalFunctionalRoute,
	InternalObjectRoute,
	InternalRoute,
	RouteType
} from "./InternalRoute";
import { FunctionalRoute, Route } from "./Route";
import { ConsoleLogger, Logger } from "../logging";
import { routeMetadataKey } from "../decorator/SocketRoute";
import { ModuleConfig } from "../modules/ModuleConfig";
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

	public controller(module: ModuleConfig, ...controllers: Newable<Controller>[]) {
		for (const controller of controllers) {
			const instance = new controller();
			for (const property in instance) {
				if(this.hasValidRouteMetadata(instance, property)) {
					switch(this.getRouteType(instance[property])) {
						case RouteType.objectBased:
							this.registerObject(instance, module, property);
							break;
						case RouteType.functionBased:
							this.registerFunctional(instance, module, property);
							break;
						case RouteType.classBased:
							this.registerClass(instance, module, property);
							break;
					}
				}
			}
		}
	}
	
	public registerClass(target: any, module: ModuleConfig, property?: string) {
		const metadata = this.getRouteMetadata(target, property);
		
		let instance: Route;
		if(property) {
			instance = new target[property]();
		} else {
			instance = new target();
		}
		
		// TODO: Add support for nested routes ?
		
		this.concatNamespace(metadata, module.namespace);
		const internalRoute = new InternalClassRoute(metadata, instance);
		
		this.addRoute(internalRoute);
	}
	
	public registerFunctional(target: any, module: ModuleConfig, property?: string) {
		const metadata = this.getRouteMetadata(target, property);
		
		let instance: FunctionalRoute;
		if(property) {
			instance = target[property];
		} else {
			instance = target;
		}
		
		this.concatNamespace(metadata, module.namespace);
		const internalRoute = new InternalFunctionalRoute(metadata, instance);
		
		this.addRoute(internalRoute);
	}
	
	public registerObject(target: any, module: ModuleConfig, property?: string) {
		const metadata = this.getRouteMetadata(target, property );
		
		let instance: Route;
		if(property) {
			instance = target[property];
		} else {
			instance = target;
		}
		
		this.concatNamespace(metadata, module.namespace);
		const internalRoute = new InternalObjectRoute(metadata, instance);
		
		this.addRoute(internalRoute);
	}
	
	protected getRouteMetadata(target: any, property?: string): RouteConfig {
		let metadata: RouteConfig;
		if(property) {
			metadata = Metadata.getPropertyDecorator(routeMetadataKey, target, property);
		} else {
			metadata = Metadata.getClassDecorator(routeMetadataKey, target);
		}

		if(!metadata) throw new Error("Tried to register a class Route with no decorator");
		
		return metadata;
	}
	
	public getRouteType(target: any): RouteType {
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
	
	protected hasValidRouteMetadata(target: any, property?: string) {
		try {
			this.getRouteMetadata(target, property);
			return true;
		} catch(error) {
			return false;
		}
	}
	
	protected concatNamespace(route: RouteConfig, namespace: string) {
		route.path = `${namespace}${this.config.seperationConvention}${route.path}`;
	}

	protected addRoute(route: InternalRoute) {
		this.logger.info(`Registering Route: ${route.getRoutePath()}`);
		this.routes.push(route);
	}
}
