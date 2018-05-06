import { Validator, ValidationResult, RuleSchema } from "../validation/Validator";
import { populateObject } from "../utility";
import { Logger, ConsoleLogger } from "../logging";
import { AbsentPropertyError } from "../errors";
import { Response, Request } from "../io";
import { RouteCollection } from "./RouteCollection";
import { InternalRoute } from "./InternalRoute";
import { getModelProps } from "../decorator/ModelProp";
import { SocketPacket } from "../structures/SocketPacket";
import { Newable } from "../structures/Newable";
import { Route } from "./Route";
import { Model } from "../model";

export type NewableRoute = Newable<Route>;

export class Router {
	public routeContainer: RouteCollection;
	protected logger: Logger;

	public constructor(protected server: SocketIO.Server) {
		this.routeContainer = new RouteCollection({ namespace: "", controllers: [] });
		this.logger = new ConsoleLogger("Router");
	}

	public async route(packet: SocketIO.Packet, socket: SocketIO.Socket) {
		const socketPacket = SocketPacket.fromSocketIOPacket(packet);

		const route = this.routeContainer.findForPacket(socketPacket);
		if (!route) {
			return this.logger.warning(`Could not find a route for ${socketPacket.getRoutePath()}`);
		}

		await this.invokeRoute(route, socket, socketPacket);
	}

	protected async triggerValidationError(route: InternalRoute, error: Error, socket: SocketIO.Socket, packet: SocketPacket) {
		try {
			await route.callOnValidationError(error, new Request(null, socket, packet), new Response(socket, route, this.server));
		} catch (error) {
			await this.triggerInternalError(route, error, socket, packet);
		}
	}

	protected async triggerInternalError(route: InternalRoute, error: Error, socket: SocketIO.Socket, packet: SocketPacket) {
		await route.callOnError(error, new Request(null, socket, packet), new Response(socket, route, this.server));
	}

	protected async invokeRoute(route: InternalRoute, socket: SocketIO.Socket, packet: SocketPacket) {
		const response = new Response(socket, route, this.server);

		const execute = async validationResult => {
			if (validationResult.didFail()) {
				await this.triggerValidationError(route, validationResult.errors[0], socket, packet);
			} else {
				const request = new Request(validationResult.target, socket, packet);
				try {
					await route.callOn(request, response);
				} catch (error) {
					await this.triggerInternalError(route, error, socket, packet);
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

	// TODO: Implement this as a middleware.
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
