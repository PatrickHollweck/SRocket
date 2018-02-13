import * as _ from 'lodash';
import * as RouteDecorator from './decorator/Route';

import { RouteConfig } from './RouteConfig';
import { TypedPair } from '../structures/Pair';
import { Newable } from './../structures/Newable';

import Response, { EmitType } from './../interaction/Response';
import Request from '../interaction/Request';
import Route from './Route';

const debug = require('debug')('srocket:Router');

export type NewableRoute = Newable<Route>;

export enum RouterCallbackType {
	BEFORE_EVENT,
	ON_EVENT,
	AFTER_EVENT,
}

export class InternalRoute extends Route {
	public config: RouteConfig;
	public instance: Route;

	public constructor(config: RouteConfig, instance: Route) {
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
	private server:SocketIOExt.Server;

	private beforeCallbacks: Function[];
	private afterCallbacks: Function[];

	public constructor(server:SocketIOExt.Server) {
		this.routes = new Array<InternalRoute>();
		this.server = server;

		this.beforeCallbacks = new Array<Function>();
		this.afterCallbacks = new Array<Function>();
	}

	public route(packet: SocketIOExt.Packet, socket: SocketIOExt.Socket) {
		const route = this.findRoute(packet);
		if (!route) {
			debug(`WARNING! - Could not find a route for ${packet.data[0]}`);
			return;
		}

		this.invokeRoute(route, socket, packet);
	}

	public register(route: NewableRoute, routeConfig?: RouteConfig) {
		const instance = new route();
		const internalRoute = new InternalRoute(routeConfig || this.getRouteConfig(route), instance);

		debug(`Registering Route: ${internalRoute.getRoute()}`);

		const nestedRoutes = new Array<TypedPair<RouteConfig, NewableRoute>>();
		const properties = Object.getOwnPropertyNames(instance);
		for (const property of properties) {
			const metadata = RouteDecorator.getNestedRouteMetadata(instance, property);
			if (metadata) {
				const nestedRoute = instance[property];
				nestedRoutes.push(new TypedPair(metadata, nestedRoute));
			}
		}

		if (nestedRoutes.length > 0) {
			for (const nestedRoute of nestedRoutes) {
				nestedRoute.key.route = internalRoute.getRoute() + nestedRoute.key.route;
				this.register(nestedRoute.value, nestedRoute.key);
			}
		}

		this.routes.push(internalRoute);
	}

	public registerCallback(type: RouterCallbackType, callback: Function) {
		this.findCallbackCollection(type).push(callback);
	}

	private findRoute(packet: SocketIOExt.Packet) {
		for (const route of this.routes) {
			if (route.getRoute() === packet.data[0]) {
				return route;
			}
		}

		return null;
	}

	private runCallbacks(type: RouterCallbackType, ...args) {
		this.findCallbackCollection(type).forEach(fn => fn(args));
	}

	private findCallbackCollection(type: RouterCallbackType) {
		switch (type) {
			case RouterCallbackType.BEFORE_EVENT:
				return this.beforeCallbacks;
			case RouterCallbackType.AFTER_EVENT:
				return this.afterCallbacks;

			default:
				throw new Error(`Found no fitting callback collection for callback type: ${type}`);
		}
	}

	private getRouteConfig(route: NewableRoute): RouteConfig {
		return RouteDecorator.getRouteMetadata(route);
	}

	private getNestedRouteConfig(route: NewableRoute, property: string): RouteConfig {
		return RouteDecorator.getNestedRouteMetadata(route, property);
	}

	private invokeRoute(route: InternalRoute, socket: SocketIOExt.Socket, packet:SocketIOExt.Packet) {
		const instance = route.getInstance();
		const request = new Request(socket, packet);
		const response = new Response(socket, route, this.server);

		this.runCallbacks(RouterCallbackType.BEFORE_EVENT);
		instance.on(request, response);
		this.runCallbacks(RouterCallbackType.AFTER_EVENT);
	}
}