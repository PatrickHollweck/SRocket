import { Newable } from "../structures/Newable";
import { SRequest } from "../io/SRequest";
import { SResponse } from "../io/SResponse";
import { RouteConfig } from "./RouteConfig";
import { Route, RouteReturn, ObjectRoute, FunctionalRoute, ControllerMetaRoute } from "./Route";

export abstract class InternalRoute<T extends Route> {
	public config: RouteConfig;
	protected handler: T;

	constructor(handler: T, config: RouteConfig) {
		this.handler = handler;
		this.config = config;
	}

	public abstract callOn(req: SRequest, res: SResponse): RouteReturn;
}

export class ObjectInternalRoute extends InternalRoute<ObjectRoute> {
	constructor(handler: ObjectRoute, config: RouteConfig) {
		super(handler, config);
	}

	async callOn(req: SRequest, res: SResponse) {
		await this.handler.on(req, res);
	}
}

export class ClassInternalRoute extends InternalRoute<ObjectRoute> {
	constructor(handler: Newable<ObjectRoute>, config: RouteConfig) {
		super(new handler(), config);
	}

	async callOn(req: SRequest, res: SResponse) {
		await this.handler.on(req, res);
	}
}

export class FunctionalInternalRoute extends InternalRoute<FunctionalRoute> {
	constructor(handler: FunctionalRoute, config: RouteConfig) {
		super(handler, config);
	}

	async callOn(req: SRequest, res: SResponse) {
		await this.handler(req, res);
	}
}

export class ControllerMetaInternalRoute extends InternalRoute<ControllerMetaRoute> {
	constructor(handler: ControllerMetaRoute, config: RouteConfig) {
		super(handler, config);
	}

	async callOn(request: SRequest) {
		this.handler(request.socket);
	}
}
