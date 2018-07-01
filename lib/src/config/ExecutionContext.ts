import { Newable } from "../structures/Newable";
import { Middleware } from "../middleware/Middleware";

export class ExecutionContext {
	public globalMiddleware: Newable<Middleware>[];

	constructor() {
		this.globalMiddleware = [];
	}
}
