import { Newable } from "../structures/Newable";
import { RouteConfig } from "./RouteConfig";
import { Route, RouteReturn, ObjectRoute, FunctionalRoute } from "./Route";

export abstract class InternalRoute<T extends Route> {
	public config: RouteConfig;
	protected handler: T;

	constructor(handler: T, config: RouteConfig) {
		this.handler = handler;
		this.config = config;
	}

	abstract callOn(): RouteReturn;
}

export class ObjectInternalRoute extends InternalRoute<ObjectRoute> {
	constructor(handler: ObjectRoute, config: RouteConfig) {
		super(handler, config);
	}

	async callOn() {
		await this.handler.on();
	}
}

export class ClassInternalRoute extends InternalRoute<ObjectRoute> {
	constructor(handler: Newable<ObjectRoute>, config: RouteConfig) {
		super(new handler(), config);
	}

	async callOn() {
		await this.handler.on();
	}
}

export class FunctionalInternalRoute extends InternalRoute<FunctionalRoute> {
	constructor(handler: FunctionalRoute, config: RouteConfig) {
		super(handler, config);
	}

	async callOn() {
		await this.handler();
	}
}
