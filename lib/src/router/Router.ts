import * as _ from 'lodash';
import * as RouteDecorator from 'src/decorator/Route';
import * as ClassValidator from 'class-validator';

import { getModelProps } from 'src/io/model/ModelProp';
import { RouteConfig } from 'src/router/RouteConfig';
import { TypedPair } from 'src/structures/Pair';
import { Newable } from 'src/structures/Newable';

import MissingPropertyError from 'src/errors/validation/MissingPropertyError';
import CallbackCollection from '../helpers/CallbackCollection';
import WrongTypeError from 'src/errors/validation/WrongTypeError';
import Validator from 'src/validation/Validator';
import Metadata from 'src/decorator/Metadata';
import Response from 'src/io/Response';
import Request from 'src/io/Request';
import Route from 'src/router/Route';
import Model from 'src/io/model/Model';

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
		const response = new Response(socket, route, this.server);

		let validatedModel: Model | null;
		try {
			validatedModel = this.validatePacket(route, packet);
		} catch (e) {
			this.callbacks.executeFor(RouterCallbackType.VALIDATION_ERROR, e);
			instance.onValidationError(e, new Request(packet.data[1], socket, packet), response);
			return;
		}

		this.callbacks.executeFor(RouterCallbackType.BEFORE_EVENT);
		instance.before();
		instance.on(new Request(validatedModel, socket, packet), response);
		instance.after();
		this.callbacks.executeFor(RouterCallbackType.AFTER_EVENT);
	}

	protected validatePacket(route: InternalRoute, packet: SocketIOExt.Packet): Model | null {
		// TODO: Refactor!

		const actuallArgs = packet.data[1];
		const expectedArgs = route.config.data;

		if (_.isNil(actuallArgs)) {
			throw new MissingPropertyError('Received null from the socket! All props are missing!', '*');
		}

		const validatedModel = this.validateModel(route, actuallArgs);
		if (validatedModel) {
			return validatedModel;
		}

		if (_.isNil(expectedArgs)) return null;

		for (const expectedProp in expectedArgs) {
			const packetArg = actuallArgs[expectedProp];
			const expectedArg = expectedArgs[expectedProp];

			if (expectedArg.rules) {
				Validator.validateRulesString(packetArg, expectedArg.rules);
			} else if (expectedArg.rulesObj) {
				Validator.validateRulesObj(packetArg, expectedArg.rulesObj);
			}

			Validator.checkType(packetArg, expectedArg.type);
		}

		return actuallArgs;
	}

	protected validateModel(route: InternalRoute, actuallArgs: any): Model | null {
		if (!route.config.model) return null;

		const instance = new route.config.model();
		this.setModelData(route, instance, actuallArgs);

		const errors = ClassValidator.validateSync(instance);
		if (errors.length > 0) {
			throw new Error(`ClassValidation error! - ${this.getFirstClassValidationErrorMessage(errors)}`);
		} else {
			return instance;
		}
	}

	protected setModelData(route: InternalRoute, instance: Model, actuallArgs: any) {
		if (!route.config.model) return;

		const properties = getModelProps(route.config.model);
		const actuallProperties = Object.getOwnPropertyNames(actuallArgs);

		for (const property of properties) {
			if (!actuallProperties.includes(property)) {
				throw new Error('Missing prop!');
			}

			for (const actuallProperty of actuallProperties) {
				if (property === actuallProperty) {
					instance[property] = actuallArgs[actuallProperty];
				}
			}
		}
	}

	protected getFirstClassValidationErrorMessage(errors: ClassValidator.ValidationError[]): string {
		const firstError = errors[0].constraints;
		const firstErrorKey = Object.keys(firstError)[0];
		const firstErrorMessage = errors[0].constraints[firstErrorKey];

		return firstErrorMessage;
	}
}