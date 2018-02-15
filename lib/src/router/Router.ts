import * as RouteDecorator from 'src/decorator/Route';

import { RouteConfig } from 'src/router/RouteConfig';
import { TypedPair } from 'src/structures/Pair';
import { Newable } from 'src/structures/Newable';

import MissingPropertyError from 'src/errors/validation/MissingPropertyError';
import CallbackCollection from '../helpers/CallbackCollection';
import WrongTypeError from 'src/errors/validation/WrongTypeError';
import Metadata from 'src/decorator/Metadata';
import Response from 'src/io/Response';
import Request from 'src/io/Request';
import Route from 'src/router/Route';

// TODO: Allow to pass arguments to the route constructor;

const debug = require('debug')('srocket:Router');

export type NewableRoute = Newable<Route>;

export enum RouterCallbackType {
	BEFORE_EVENT = 'beforeEvent',
	AFTER_EVENT = 'afterEvent',
	VALIDATION_ERROR = 'onValidationError',
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
	protected callbacks: CallbackCollection;

	public constructor(server: SocketIOExt.Server) {
		this.routes = new Array<InternalRoute>();
		this.server = server;

		this.callbacks = new CallbackCollection();
		this.callbacks.registerCollection(RouterCallbackType.BEFORE_EVENT);
		this.callbacks.registerCollection(RouterCallbackType.AFTER_EVENT);
		this.callbacks.registerCollection(RouterCallbackType.VALIDATION_ERROR);
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
			const metadata = this.getNestedRouteConfig(instance, property);
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
		this.callbacks.addCallback(type, callback);
	}

	protected getRouteConfig(route: Route | NewableRoute): RouteConfig {
		return Metadata.getClassDecorator(RouteDecorator.routeMetadataKey, route);
	}

	protected getNestedRouteConfig(route: Route | NewableRoute, property: string): RouteConfig {
		return Metadata.getPropertyDecorator(RouteDecorator.nestedRouteMetadataKey, route, property);
	}

	protected findRoute(packet: SocketIOExt.Packet) {
		for (const route of this.routes) {
			if (route.getRoute() === packet.data[0]) {
				return route;
			}
		}

		return null;
	}

	protected invokeRoute(route: InternalRoute, socket: SocketIOExt.Socket, packet: SocketIOExt.Packet) {
		const instance = route.getInstance();
		const request = new Request(socket, packet);
		const response = new Response(socket, route, this.server);

		try {
			this.validateArgs(route, packet);
		} catch (e) {
			this.callbacks.executeFor(RouterCallbackType.VALIDATION_ERROR, e);
			instance.onValidationError(e, request, response);
			return;
		}

		this.callbacks.executeFor(RouterCallbackType.BEFORE_EVENT);
		instance.before();
		instance.on(packet.data[1], request, response);
		instance.after();
		this.callbacks.executeFor(RouterCallbackType.AFTER_EVENT);
	}

	protected validateArgs(route: InternalRoute, packet: SocketIOExt.Packet): MissingPropertyError | WrongTypeError | void {
		const packetArgs = packet.data[1];
		const expectedArgs = route.config.data;
		if (expectedArgs) {
			for (const expectedProp in expectedArgs) {
				const packetProp = packetArgs[expectedProp];
				if (packetProp === undefined) {
					throw new MissingPropertyError(`Expected property ${expectedProp} is missing`, expectedProp);
				}

				const packetArgType = packetArgs[expectedProp].constructor;
				const expectedArgType = expectedArgs[expectedProp];

				if (packetArgType !== expectedArgType) {
					throw new WrongTypeError(`The prop ${packetProp} has the type ${packetArgType} but should have type: ${expectedArgType}`, packetArgType, expectedArgType);
				}
			}
		}
	}
}