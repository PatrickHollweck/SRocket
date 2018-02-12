import * as _ from 'lodash';
import * as RouteDecorator from './decorator/Route';

import { RouteConfig } from './RouteConfig';
import Route, { NestedRoute } from './Route';

const debug = require('debug')('srocket:Router');

export type NewableRoute<T extends Route> = { new(...args: any[]): T };

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
	private routes: InternalRoute[];

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

	public register(route: NewableRoute<Route>, routeConfig?:RouteConfig) {
		const instance = new route();
		const internalRoute = new InternalRoute(routeConfig || this.getRouteConfig(route), instance);

		debug(`Registering Route: ${internalRoute.getRoute()}`);

		const nestedRoutes = instance.getNestedRoutes();
		if(nestedRoutes.length > 0) {
			for(const nestedRoute of nestedRoutes) {
				const nestedRouteConfig = this.getRouteConfig(nestedRoute);
				nestedRouteConfig.route = internalRoute.config.route + nestedRouteConfig.route;
				this.register(nestedRoute, nestedRouteConfig);
			}
		}

		this.routes.push(internalRoute);
	}

	private isRouteNested(route:NewableRoute<Route>) {
		return _.has(new route(), 'config');
	}

	private getRouteConfig(route:NewableRoute<Route>) : RouteConfig {
		let routeConfig = RouteDecorator.getMetadata(route);
		if (!routeConfig) {
			if (this.isRouteNested(route)) {
				routeConfig = _.get(new route(), 'config');
			} else {
				throw new Error(`The Route ${route} must have a @RouteConfig decorator or be a nested Route!`);
			}
		}

		return routeConfig;
	}

	private setRouteConfig(route:NewableRoute<Route>, routeConfig:RouteConfig) {
		if(this.isRouteNested(route)) {
			const x = _.set(route, 'config', routeConfig);
			//console.log(x);
			return x;
		} else {
			throw new Error('Setting the config for not nested routes is not implemented yet!');
		}
	}

	private invokeRoute(route: InternalRoute, socket: SocketIOExt.Socket) {
		const instance = route.getInstance();
		instance.before(socket);
		instance.on(socket);
		instance.after(socket);
	}
}