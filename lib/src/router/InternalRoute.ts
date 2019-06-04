import { SEvent } from "../io/SEvent";
import { Newable } from "../structures/Newable";
import { SRequest } from "../io/SRequest";
import { SResponse } from "../io/SResponse";
import { RouteConfig } from "./types/RouteConfig";
import { Route, RouteReturn, ObjectRoute, FunctionalRoute, ControllerMetaRoute } from "./Route";

export abstract class InternalRoute<T extends Route> {
	public config: RouteConfig;
	protected handler: T;

	public constructor(handler: T, config: RouteConfig) {
		this.handler = handler;
		this.config = config;
	}

	public abstract callOn(req: SRequest, res: SResponse): RouteReturn;
	public abstract callError(e: Error, req: SRequest, res: SResponse): RouteReturn;

	public static convertToEvent(request: SRequest, response: SResponse) {
		return new SEvent(request, response);
	}

	// tslint:disable-next-line:ban-types
	public static async invokeEventOrArgs(handler: Function, req: SRequest, res: SResponse) {
		if (handler.length === 2) {
			await handler(req, res);
		} else {
			await handler(InternalRoute.convertToEvent(req, res));
		}
	}
}

export class ObjectInternalRoute extends InternalRoute<ObjectRoute> {
	public constructor(handler: ObjectRoute, config: RouteConfig) {
		super(handler, config);
	}

	public async callError(e: Error, req: SRequest, res: SResponse) {
		if (this.handler.onError) {
			InternalRoute.invokeEventOrArgs(this.handler.onError, req, res);
		}
	}

	public async callOn(req: SRequest, res: SResponse) {
		InternalRoute.invokeEventOrArgs(this.handler.on, req, res);
	}
}

export class ClassInternalRoute extends InternalRoute<ObjectRoute> {
	protected masked: ObjectInternalRoute;

	public constructor(handler: Newable<ObjectRoute>, config: RouteConfig) {
		const instance = new handler();
		super(instance, config);
		this.masked = new ObjectInternalRoute(instance, config);
	}

	public async callError(e: Error, req: SRequest, res: SResponse) {
		await this.masked.callError(e, req, res);
	}

	public async callOn(req: SRequest, res: SResponse) {
		await this.masked.callOn(req, res);
	}
}

export class FunctionalInternalRoute extends InternalRoute<FunctionalRoute> {
	public constructor(handler: FunctionalRoute, config: RouteConfig) {
		super(handler, config);
	}

	public async callError(e: Error, req: SRequest, res: SResponse) {
		/* - */
	}

	public async callOn(req: SRequest, res: SResponse) {
		await InternalRoute.invokeEventOrArgs(this.handler, req, res);
	}
}

export class ControllerMetaInternalRoute extends InternalRoute<ControllerMetaRoute> {
	public constructor(handler: ControllerMetaRoute) {
		super(handler, {
			beforeMiddleware: [],
			afterMiddleware: [],
			path: ""
		});
	}

	public async callError(e: Error, req: SRequest, res: SResponse) {
		/* - */
	}

	public async callOn(request: SRequest) {
		this.handler(request.socket);
	}
}
