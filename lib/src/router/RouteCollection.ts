import { SocketPacket } from "../structures/SocketPacket";
import { InternalRoute } from "./InternalRoute";
import { NewableRoute, Router } from "./Router";
import { RouteConfig } from "./RouteConfig";
import { Metadata } from "../utility";
import { Route } from "./Route";
import * as RouteDecorator from "../decorator/Route";
import { ConsoleLogger, Logger } from "../logging";

export class RouteCollection {
	protected routes: InternalRoute[];
	protected logger: Logger;
	
	constructor() {
		this.logger = new ConsoleLogger("RouteCollector");
		this.routes = [];
	}
	
	public find(packet: SocketPacket) {
		return this.routes.find(internalRoute => internalRoute.getRoutePath() === packet.getRoutePath());
	}

	public registerBulk(...routes: Array<NewableRoute>) {
		routes.forEach(route => this.register(route));
	}
	
	public register(route: NewableRoute, routeConfig?: RouteConfig) {
		const instance = new route();
		const internalRoute = new InternalRoute(routeConfig || RouteCollection.getRouteConfig(route), instance);

		this.logger.info(`Registering Route: ${internalRoute.getRoutePath()}`);

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

		this.routes.push(internalRoute);
	}

	protected static getRouteConfig(route: Route | NewableRoute): RouteConfig {
		return Metadata.getClassDecorator(RouteDecorator.routeMetadataKey, route);
	}
}