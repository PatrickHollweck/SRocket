import * as _ from 'lodash';
import * as RouteDecorator from './decorator/Route';

import { RouteConfig } from './RouteConfig';
import Route from './Route';
import { TypedPair } from '../structures/Pair';

const debug = require('debug')('srocket:Router');

export type NewableRoute = { new(...args: any[]): Route };

class InternalRoute extends Route {
	public config: RouteConfig;
	public instance: Route;

	public constructor(config:RouteConfig, instance:Route) {
		super();

		this.config = config;
		this.instance = instance;
	}

	public getInstance() {
		return this.instance;
	}

	public getRoute() {
		return this.config.route;
	}
}

export default class Router {
	private routes:InternalRoute[];

	public constructor() {
		this.routes = new Array<InternalRoute>();
	}

	public route(packet: SocketIOExt.Packet, socket: SocketIOExt.Socket) {
		for (const route of this.routes) {
			if (route.getRoute() === packet.data[0]) {
				this.invokeRoute(route, socket);
				return;
			}
		}

		debug(`WARNING! - Could not find a route for ${packet.data[0]}`);
	}

	public register(route: NewableRoute, routeConfig?:RouteConfig) {
		const instance = new route();
		const internalRoute = new InternalRoute(routeConfig || this.getRouteConfig(route), instance);

		debug(`Registering Route: ${internalRoute.getRoute()}`);

		const nestedRoutes = new Array<TypedPair<RouteConfig, NewableRoute>>();
		const properties = Object.getOwnPropertyNames(instance);
		for(const property of properties) {
			const metadata = RouteDecorator.getNestedRouteMetadata(instance, property);
			if(metadata) {
				const nestedRoute = instance[property];
				nestedRoutes.push(new TypedPair(metadata, nestedRoute));
			}
		}

		if(nestedRoutes.length > 0) {
			for(const nestedRoute of nestedRoutes) {
				nestedRoute.key.route = internalRoute.getRoute() + nestedRoute.key.route;
				this.register(nestedRoute.value, nestedRoute.key);
			}
		}

		this.routes.push(internalRoute);
	}

	private getRouteConfig(route:NewableRoute) : RouteConfig {
		return RouteDecorator.getRouteMetadata(route);
	}

	private getNestedRouteConfig(route:NewableRoute, property:string) : RouteConfig {
		return RouteDecorator.getNestedRouteMetadata(route, property);
	}


	private invokeRoute(route: InternalRoute, socket: SocketIOExt.Socket) {
		const instance = route.getInstance();
		instance.before(socket);
		instance.on(socket);
		instance.after(socket);
	}
}