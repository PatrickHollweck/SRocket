import * as _ from 'lodash';
import * as ClassValidator from 'class-validator';
import * as RouteDecorator from '../router/decorator/Route';

import { Validator, ValidationContext, ValidationResult } from '../validation/Validator';
import { RouteConfig, RuleType } from '../router/RouteConfig';
import { AbsentPropertyError } from '../errors/AbsentPropertyError';
import { CallbackCollection } from '../utility/CallbackCollection';
import { ValidationError } from '../errors/ValidationError';
import { isAsyncFunction } from 'is-async-function';
import { populateObject } from '../utility/PopulateObject';
import { InternalRoute } from '../router/InternalRoute';
import { getModelProps } from '../model/decorator/ModelProp';
import { TypedPair } from '../structures/Pair';
import { Response } from '../io/Response';
import { Metadata } from '../utility/Metadata';
import { Request } from '../io/Request';
import { Newable } from '../structures/Newable';
import { Route } from '../router/Route';
import { Model } from '../model/Model';

const debug = require('debug')('srocket:Router');

export type NewableRoute = Newable<Route>;

export enum RouterCallbackType {
	BEFORE_EVENT = 'beforeEvent',
	AFTER_EVENT = 'afterEvent',
	VALIDATION_ERROR = 'onValidationError',
}

// TODO: Allow to pass arguments to the route constructor;
export class Router {
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

		this.invokeRoute(route, socket, packet).then();
	}

	public registerBulk(...routes: Array<NewableRoute>) {
		for (const route of routes) {
			this.register(route);
		}
	}

	public register(route: NewableRoute, routeConfig?: RouteConfig) {
		const instance = new route();
		const internalRoute = new InternalRoute(routeConfig || this.getRouteConfig(route), instance);

		debug(`Registering Route: ${internalRoute.getRoutePath()}`);

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
				nestedRoute.key.path = internalRoute.getRoutePath() + nestedRoute.key.path;
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
			if (route.getRoutePath() === packet.data[0]) {
				return route;
			}
		}

		return null;
	}

	protected triggerValidationError(route: InternalRoute, error: Error, socket: SocketIOExt.Socket, packet: SocketIOExt.Packet) {
		try {
			route.getInstance().onValidationError(error, new Request(null, socket, packet), new Response(socket, route, this.server));
		} catch (error) {
			this.triggerInternalError(route, error, socket, packet);
		}
	}

	protected triggerInternalError(route: InternalRoute, error: Error, socket: SocketIOExt.Socket, packet: SocketIOExt.Packet) {
		route.getInstance().onError(error, new Request(null, socket, packet), new Response(socket, route, this.server));
	}

	protected invokeRoute(route: InternalRoute, socket: SocketIOExt.Socket, packet: SocketIOExt.Packet): Promise<void> {
		return new Promise((resolve, reject) => {
			const instance = route.getInstance();
			const response = new Response(socket, route, this.server);

			const execute = (validationResult) => {
				if (validationResult.didFail()) {
					this.triggerValidationError(route, validationResult.errors[0], socket, packet);
				} else {
					const request = new Request(validationResult.target, socket, packet);
					try {
						this.callbacks.executeFor(RouterCallbackType.BEFORE_EVENT);
						instance.before(request, response);
						new Promise((innerResolve, innerReject) => instance.on(request, response)).then();
						instance.after(request, response);
						this.callbacks.executeFor(RouterCallbackType.AFTER_EVENT);
					} catch (error) {
						this.triggerInternalError(route, error, socket, packet);
					}
				}
			};

			if (route.config.model) {
				this.validateWithModel(route.config.model, packet)
					.then(execute);
			}

			if (route.config.data) {
				this.validateWithRules(route.config.data, packet)
					.then(execute);
			}
		});
	}

	protected validateWithModel(model: Newable<Model>, packet: SocketIOExt.Packet): Promise<ValidationResult> {
		return new Promise((resolve, reject) => {
			const actuallArgs = packet.data[1];
			if (!actuallArgs) {
				return resolve(new ValidationResult(null, [new AbsentPropertyError('Got no data from the socket! All Properties are missing!', '*')]));
			}

			const setDataResult = populateObject<Model>(model, actuallArgs, getModelProps(model));
			if (setDataResult.value.length > 0) {
				return resolve(new ValidationResult(null, setDataResult.value));
			}

			Validator.validateClass(setDataResult.key)
				.then(result => {
					if (result.didFail()) {
						return resolve(new ValidationResult(null, result.errors));
					} else {
						return resolve(new ValidationResult(result.target));
					}
				});
		});
	}

	protected validateWithRules(expectedArgs: RuleType, packet: SocketIOExt.Packet): Promise<ValidationResult> {
		return new Promise((resolve, reject) => {
			// TODO: Build wrapper on top of sio.packet...
			// TODO: Outsource this to the Validator class.
			const actuallArgs = packet.data[1];

			if (!actuallArgs) {
				return resolve(new ValidationResult(null, [new AbsentPropertyError('Got no data from the socket! All properties are missing!', '*')]));
			}

			for (const expectedProperty of Object.getOwnPropertyNames(expectedArgs)) {
				const currentExpectedArg = expectedArgs[expectedProperty];
				const currentActuallArg = actuallArgs[expectedProperty];

				if (currentActuallArg === undefined) {
					return resolve(new ValidationResult(null, [new AbsentPropertyError(`The property ${expectedProperty} is missing!`, expectedProperty)]));
				}

				if (!Validator.checkType(currentActuallArg, currentExpectedArg.type)) {
					return resolve(new ValidationResult(null, [new TypeError(`The type of the property should be ${currentExpectedArg.type} but is ${currentActuallArg.constructor}`)]));
				}

				if (currentExpectedArg.rules) {
					for (const rule of currentExpectedArg.rules) {
						if (!rule.rule(currentActuallArg, rule.args)) {
							if (rule.message) {
								return resolve(new ValidationResult(
									null,
									[new ValidationError(Validator.parseMessage(
										rule.message,
										new ValidationContext(
											rule.args || [],
											expectedProperty,
											currentActuallArg,
											currentExpectedArg
										)
									))]
								));
							} else {
								return resolve(new ValidationResult(null, [new ValidationError(`Validation Rule: "${rule.rule.name}" with args: "${rule.args}" failed!`)]));
							}
						}
					}
				}
			}

			return resolve(new ValidationResult(actuallArgs));
		});
	}
}