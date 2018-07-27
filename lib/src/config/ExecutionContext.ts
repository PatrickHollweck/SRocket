import { Newable } from "../structures/Newable";
import { Middleware } from "../middleware/Middleware";

export class ExecutionContext {
	public separationConvention: string = ":";
	public globalMiddleware: Newable<Middleware>[];

	constructor() {
		this.globalMiddleware = [];
	}
}
