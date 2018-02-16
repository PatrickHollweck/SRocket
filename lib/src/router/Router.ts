import * as _ from 'lodash';
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
import Validator from 'src/validation/Validator';

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
		this.callbacks.registerCollections([
			RouterCallbackType.BEFORE_EVENT,
			RouterCallbackType.AFTER_EVENT,
			RouterCallbackType.VALIDATION_ERROR,
		]);
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
			this.validatePacket(route, packet);
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

	protected validatePacket(route: InternalRoute, packet: SocketIOExt.Packet): MissingPropertyError | WrongTypeError | void {
		const actuallArgs = packet.data[1];
		const expectedArgs = route.config.data;

		// Check if both the sent args and the arg definitions exist.
		if (_.isNil(actuallArgs) || _.isNil(expectedArgs)) {
			// TODO: Meh.
			throw new MissingPropertyError('Received null from the socket! All props are missing!', '*');
		}

		// For each property in the expected properties...
		for (const expectedProp in expectedArgs) {
			const packetArg = actuallArgs[expectedProp];
			const expectedArg = expectedArgs[expectedProp];

			// Validate the associated Rules
			Validator.validateRulesString(packetArg, expectedArg.rules);

			// and check the Type of the arg.
			Validator.checkType(packetArg, expectedArg.type);
		}
	}
}