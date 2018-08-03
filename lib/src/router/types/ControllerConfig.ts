import { Middleware } from "../../middleware/Middleware";
import { Newable } from "../../structures/Newable";

export interface UserControllerConfig {
	prefix?: string;
	namespace?: string;
	beforeMiddleware?: Newable<Middleware>[];
	afterMiddleware?: Newable<Middleware>[];
	[index: string]: any;
}

export interface ControllerConfig {
	prefix: string;
	namespace: string;
	beforeMiddleware: Newable<Middleware>[];
	afterMiddleware: Newable<Middleware>[];
	[index: string]: any;
}
