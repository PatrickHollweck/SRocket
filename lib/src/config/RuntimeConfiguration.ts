import { Newable } from "../structures/Newable";
import { Middleware } from "../middleware/Middleware";
import { LogLevel } from "../logging/Logger";

export class RuntimeConfiguration {
	public separationConvention: string = ":";

	public beforeGlobalMiddleware: Newable<Middleware>[];
	public afterGlobalMiddleware: Newable<Middleware>[];

	public logLevel: LogLevel;

	constructor() {
		this.beforeGlobalMiddleware = [];
		this.afterGlobalMiddleware = [];

		this.logLevel = LogLevel.Info;
	}
}
