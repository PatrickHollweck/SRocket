import { Route, RouteReturn, ObjectRoute, FunctionalRoute } from "./metadata/RouteMetadataStore";

export abstract class InternalRoute<T extends Route> {
	protected handler: T;

	constructor(handler: T) {
		this.handler = handler;
	}

	abstract callOn(): RouteReturn;
}

export class ObjectInternalRoute extends InternalRoute<ObjectRoute> {
	constructor(handler: ObjectRoute) {
		super(handler);
	}

	async callOn() {
		await this.handler.on();
	}
}

export class FunctionalInternalRoute extends InternalRoute<FunctionalRoute> {
	constructor(handler: FunctionalRoute) {
		super(handler);
	}

	async callOn() {
		await this.handler();
	}
}
