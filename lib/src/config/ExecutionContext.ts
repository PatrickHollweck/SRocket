import { Newable } from "../structures/Newable";
import { Middleware } from "../middleware/Middleware";
import { sep } from "path";

export class ExecutionContext {
	public separationConvention: string = ":";
	public globalMiddleware: Newable<Middleware>[];

	constructor() {
		this.globalMiddleware = [];
	}
}
