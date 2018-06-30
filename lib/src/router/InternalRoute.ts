import { Route, RouteReturn, ObjectRoute, FunctionalRoute } from "./metadata/RouteMetadataStore";
import { Newable } from "../structures/Newable";

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

export class ClassInternalRoute extends InternalRoute<ObjectRoute> {
	constructor(handler: Newable<ObjectRoute>) {
		super(new handler());
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
