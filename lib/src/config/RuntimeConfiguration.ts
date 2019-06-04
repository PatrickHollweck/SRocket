import { Newable } from "../structures/Newable";
import { Middleware } from "../middleware/Middleware";
import { LogLevel } from "../logging/Logger";

export class RuntimeConfiguration {
	public separationConvention = ":";

	public beforeGlobalMiddleware: Newable<Middleware>[];
	public afterGlobalMiddleware: Newable<Middleware>[];

	public logLevel: LogLevel;

	public constructor() {
		this.beforeGlobalMiddleware = [];
		this.afterGlobalMiddleware = [];

		this.logLevel = LogLevel.Info;
	}
}
