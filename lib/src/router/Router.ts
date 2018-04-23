import * as RouteDecorator from "../decorator/Route";

import { Validator, ValidationResult, RuleSchema } from "../validation/Validator";

import { CallbackCollection, populateObject, Metadata } from "../utility";
import { Logger, ConsoleLogger } from "../logging";
import { AbsentPropertyError } from "../errors";
import { Response, Request } from "../io";
import { InternalRoute } from "./InternalRoute";
import { getModelProps } from "../decorator/ModelProp";
import { SocketPacket } from "../structures/SocketPacket";
import { RouteConfig } from "./RouteConfig";
import { TypedPair } from "../structures/Pair";
import { Newable } from "../structures/Newable";
import { Route } from "./Route";
import { Model } from "../model";

export type NewableRoute = Newable<Route>;

export enum RouterCallbackType {
	BEFORE_EVENT = "beforeEvent",
	AFTER_EVENT = "afterEvent",
	VALIDATION_ERROR = "onValidationError",
	ROUTE_NOT_FOUND = "routeNotFound"
}

export class Router {
	protected logger: Logger;
	protected routes: InternalRoute[];
	protected server: SocketIO.Server;
	protected callbacks: CallbackCollection;

	public constructor(server: SocketIO.Server) {
		this.routes = new Array<InternalRoute>();
		this.server = server;
		this.logger = new ConsoleLogger("Router");

		this.callbacks = new CallbackCollection();
		this.callbacks.registerCollections([
			RouterCallbackType.BEFORE_EVENT,
			RouterCallbackType.AFTER_EVENT,
			RouterCallbackType.VALIDATION_ERROR,
			RouterCallbackType.ROUTE_NOT_FOUND
		]);
	}

	public async route(packet: SocketIO.Packet, socket: SocketIO.Socket) {
		const socketPacket = SocketPacket.fromSocketIOPacket(packet);

		const route = this.findRoute(socketPacket);
		if (!route) {
			this.callbacks.executeFor(RouterCallbackType.ROUTE_NOT_FOUND);
			return this.logger.warning(`Could not find a route for ${socketPacket.getRoutePath()}`);
		}

		await this.invokeRoute(route, socket, socketPacket);
	}

	public registerBulk(...routes: Array<NewableRoute>) {
		routes.forEach(route => this.register(route));
	}

	public register(route: NewableRoute, routeConfig?: RouteConfig) {
		const instance = new route();
		const internalRoute = new InternalRoute(routeConfig || Router.getRouteConfig(route), instance);

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

	public registerCallback(type: RouterCallbackType, callback: Function) {
		this.callbacks.addCallback(type, callback);
	}

	protected findRoute(packet: SocketPacket) {
		return this.routes.find(internalRoute => internalRoute.getRoutePath() === packet.getRoutePath());
	}

	protected triggerValidationError(route: InternalRoute, error: Error, socket: SocketIO.Socket, packet: SocketPacket) {
		try {
			this.callbacks.executeFor(RouterCallbackType.VALIDATION_ERROR);
			route.getInstance().onValidationError(error, new Request(null, socket, packet), new Response(socket, route, this.server));
		} catch (error) {
			this.triggerInternalError(route, error, socket, packet);
		}
	}

	protected triggerInternalError(route: InternalRoute, error: Error, socket: SocketIO.Socket, packet: SocketPacket) {
		route.getInstance().onError(error, new Request(null, socket, packet), new Response(socket, route, this.server));
	}

	protected async invokeRoute(route: InternalRoute, socket: SocketIO.Socket, packet: SocketPacket) {
		const instance = route.getInstance();
		const response = new Response(socket, route, this.server);

		const execute = async validationResult => {
			if (validationResult.didFail()) {
				this.triggerValidationError(route, validationResult.errors[0], socket, packet);
			} else {
				const request = new Request(validationResult.target, socket, packet);
				try {
					this.callbacks.executeFor(RouterCallbackType.BEFORE_EVENT);

					await instance.before(request, response);
					await instance.on(request, response);
					await instance.after(request, response);

					this.callbacks.executeFor(RouterCallbackType.AFTER_EVENT);
				} catch (error) {
					this.triggerInternalError(route, error, socket, packet);
				}
			}
		};

		if (!route.config.model && !route.config.data) {
			await execute(new ValidationResult({}));
		}

		if (route.config.model) {
			Router.validateWithModel(route.config.model, packet).then(execute);
		}

		if (route.config.data) {
			Router.validateWithRules(route.config.data, packet).then(execute);
		}
	}

	protected static getRouteConfig(route: Route | NewableRoute): RouteConfig {
		return Metadata.getClassDecorator(RouteDecorator.routeMetadataKey, route);
	}

	protected static async validateWithModel(model: Newable<Model>, packet: SocketPacket): Promise<ValidationResult> {
		const actualArgs = packet.getUserData();
		if (!actualArgs) {
			return new ValidationResult(null, [new AbsentPropertyError("Got no data from the socket! All Properties are missing!", "*")]);
		}

		const setDataResult = populateObject<Model>(model, actualArgs, getModelProps(model));
		if (setDataResult.value.length > 0) {
			return new ValidationResult(null, setDataResult.value);
		}

		const validationResult = await Validator.validateClass(setDataResult.key);

		if (validationResult.didFail()) {
			return new ValidationResult(null, validationResult.errors);
		} else {
			return new ValidationResult(validationResult.target);
		}
	}

	protected static async validateWithRules(schema: RuleSchema, packet: SocketPacket): Promise<ValidationResult> {
		return Validator.validateSchema(schema, packet.getUserData());
	}
}
