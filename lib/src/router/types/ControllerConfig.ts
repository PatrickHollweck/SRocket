import { Middleware } from "../../middleware/Middleware";
import { Newable } from "../../structures/Newable";

export interface UserControllerConfig {
	prefix?: string;
	namespace?: string;
	middleware?: Newable<Middleware>[];
}

export interface ControllerConfig {
	prefix: string;
	namespace: string;
	middleware: Newable<Middleware>[];
}
