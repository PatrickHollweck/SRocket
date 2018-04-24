import { ConsoleLogger, Logger } from "../logging";
import { routeMetadataKey } from "../decorator/RouteConfig";
import { InternalRoute } from "./InternalRoute";
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

	public find(packet: SocketPacket) {
		return this.routes.find(internalRoute => internalRoute.getRoutePath() === packet.getRoutePath());
	}

	public controller(module: ModuleConfig, ...controllers: Newable<Controller>[]) {
		for (const controller of controllers) {
			const instance = new controller();
			for (const property in instance) {
				const metadata = Metadata.getPropertyDecorator(routeMetadataKey, instance, property);
				if (!metadata) continue;

				const routeInstance = new instance[property]();
				this.concatNamespace(metadata, module.namespace);
				const route = new InternalRoute(metadata, routeInstance);

				this.addRoute(route);
			}
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
