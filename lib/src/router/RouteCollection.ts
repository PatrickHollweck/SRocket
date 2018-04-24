import { ConsoleLogger, Logger } from "../logging";
import { routeMetadataKey } from "../decorator/SocketRoute";
import { InternalRoute } from "./InternalRoute";
import { ModuleConfig } from "../modules/ModuleConfig";
import { SocketPacket } from "../structures/SocketPacket";
import { RouteConfig } from "./RouteConfig";
import { Controller } from "./Controller";
import { Metadata } from "../utility";
import { Newable } from "../structures/Newable";
import { inject } from "../DI/SRocketContainer";
import { Config } from "../config";
import { Route } from "./Route";

export class RouteCollection {
	@inject(Config) protected config: Config;
	protected routes: InternalRoute[];
	protected logger: Logger;

	constructor() {
		this.logger = new ConsoleLogger("RouterC");
		this.routes = [];
	}

	public find(packet: SocketPacket) {
		return this.routes.find(internalRoute => internalRoute.getRoutePath() === packet.getRoutePath());
	}

	public controller(module: ModuleConfig, ...controllers: Newable<Controller>[]) {
		for (const controller of controllers) {
			const instance = new controller();
			for (const property in instance) {
				if(this.hasValidRouteMetadata(instance, property)) {
					this.registerStandalone(instance, module, property);
				}
			}
		}
	}
	
	public registerStandalone(target: any, module: ModuleConfig, property?: string) {
		const metadata = this.getRouteMetadata(target, property );
		
		let instance: Route;
		if(property) {
			instance = new target[property]();
		} else {
			instance = new target();
		}
		
		this.concatNamespace(metadata, module.namespace);
		const internalRoute = new InternalRoute(metadata, instance);
		
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
