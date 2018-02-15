import * as _ from 'lodash';
import * as RouteDecorator from 'src/router/decorator/Route';

import { RouteConfig } from 'src/router/RouteConfig';
import { TypedPair } from 'src/structures/Pair';
import { Newable } from 'src/structures/Newable';

import ValidationError, { ValidationErrorType } from 'src/errors/ValidationError';
import Response from 'src/interaction/Response';
import Request from 'src/interaction/Request';
import Route from 'src/router/Route';

// TODO: Allow to pass arguments to the route constructor;

const debug = require('debug')('srocket:Router');

export type NewableRoute = Newable<Route>;

export enum RouterCallbackType {
	BEFORE_EVENT,
	ON_EVENT,
	AFTER_EVENT,
	VALIDATION_ERROR,
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
	protected routes: InternalRoute[];
	protected server: SocketIOExt.Server;

	protected beforeCallbacks: Function[];
	protected afterCallbacks: Function[];
	protected validationErrorCallbacks: Function[];

	public constructor(server: SocketIOExt.Server) {
		this.routes = new Array<InternalRoute>();
		this.server = server;

		this.beforeCallbacks = new Array<Function>();
		this.afterCallbacks = new Array<Function>();
		this.validationErrorCallbacks = new Array<Function>();
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

	protected invokeRoute(route: InternalRoute, socket: SocketIOExt.Socket, packet: SocketIOExt.Packet) {
		const instance = route.getInstance();
		const request = new Request(socket, packet);
		const response = new Response(socket, route, this.server);

		try {
			this.validateArgs(route, packet);
		} catch (e) {
			this.runCallbacks(RouterCallbackType.VALIDATION_ERROR, e);
			instance.onValidationError(e, request, response);
			return;
		}

		this.runCallbacks(RouterCallbackType.BEFORE_EVENT);
		instance.before();
		instance.on(packet.data[1], request, response);
		instance.after();
		this.runCallbacks(RouterCallbackType.AFTER_EVENT);
	}

	protected validateArgs(route: InternalRoute, packet: SocketIOExt.Packet): ValidationError | void {
		const packetArgs = packet.data[1];
		const expectedArgs = route.config.data;
		if (expectedArgs) {
			for (const expectedProp in expectedArgs) {
				const packetProp = packetArgs[expectedProp];
				if (packetProp === undefined) {
					throw new ValidationError(ValidationErrorType.MISSING_PROP, `NEEDED PROP - ${expectedProp} is missing`);
				}

				const packetArgType = packetArgs[expectedProp].constructor;
				const expectedArgType = expectedArgs[expectedProp];

				if (packetArgType !== expectedArgType) {
					throw new ValidationError(ValidationErrorType.WRONG_TYPE, `The prop ${packetProp} has the type ${packetArgType} but should have type: ${expectedArgType}`);
				}
			}
		}
	}
	protected getRouteConfig(route: NewableRoute): RouteConfig {
		return RouteDecorator.getRouteMetadata(route);
	}

	protected getNestedRouteConfig(route: NewableRoute, property: string): RouteConfig {
		return RouteDecorator.getNestedRouteMetadata(route, property);
	}

	protected findRoute(packet: SocketIOExt.Packet) {
		for (const route of this.routes) {
			if (route.getRoute() === packet.data[0]) {
				return route;
			}
		}

		return null;
	}

	protected findCallbackCollection(type: RouterCallbackType) {
		switch (type) {
			case RouterCallbackType.BEFORE_EVENT:
				return this.beforeCallbacks;
			case RouterCallbackType.AFTER_EVENT:
				return this.afterCallbacks;
			case RouterCallbackType.VALIDATION_ERROR:
				return this.validationErrorCallbacks;

			default:
				throw new Error(`Found no fitting callback collection for callback type: ${type}`);
		}
	}

	protected runCallbacks(type: RouterCallbackType, ...args) {
		this.findCallbackCollection(type).forEach(fn => fn(args));
	}
}