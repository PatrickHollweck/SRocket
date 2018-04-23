import * as RouteDecorator from "../decorator/RouteConfig";

import { ConsoleLogger, Logger } from "../logging";
import { InternalRoute } from "./InternalRoute";
import { SocketPacket } from "../structures/SocketPacket";
import { NewableRoute } from "./Router";
import { RouteConfig } from "./RouteConfig";
import { Controller } from "./Controller";
import { Metadata } from "../utility";
import { Route } from "./Route";
import { inject } from "../DI/SRocketContainer";
import { Config } from "../config";

export class RouteCollection {
	@inject(Config)	protected config: Config;
	protected routes: InternalRoute[];
	protected logger: Logger;
	
	constructor() {
		this.logger = new ConsoleLogger("RouteCollector");
		this.routes = [];
	}
	
	public find(packet: SocketPacket) {
		return this.routes.find(internalRoute => internalRoute.getRoutePath() === packet.getRoutePath());
	}

	public controller(...controllers: Controller[]) {
		for(const controller of controllers) {
			console.log(controller);
		}
	}
	
	public class(route: NewableRoute, routeConfig?: RouteConfig) {
		const instance = new route();
		const internalRoute = new InternalRoute(routeConfig || RouteCollection.getRouteConfig(route), instance);

		// TODO: Refactor
		// const nestedRoutes = new Array<TypedPair<RouteConfig, NewableRoute>>();
		// for (const property in instance) {
		// 	const metadata = Router.getNestedRouteConfig(instance, property);
		// 	if (metadata) {
		// 		const nestedRoute = instance[property];
		// 		nestedRoutes.push(new TypedPair(metadata, nestedRoute));
		// 	}
		// }

		// if (nestedRoutes.length > 0) {
		// 	for (const nestedRoute of nestedRoutes) {
		// 		nestedRoute.key.path = internalRoute.getRoutePath() + nestedRoute.key.path;
		// 		this.register(nestedRoute.value, nestedRoute.key);
		// 	}
		// }
		
		this.addRoute(internalRoute);
	}
	
	protected addRoute(route: InternalRoute) {
		this.logger.info(`Registering Route: ${route.getRoutePath()}`);
		this.routes.push(route);
	}

	protected static getRouteConfig(route: Route | NewableRoute): RouteConfig {
		return Metadata.getClassDecorator(RouteDecorator.routeMetadataKey, route);
	}
}