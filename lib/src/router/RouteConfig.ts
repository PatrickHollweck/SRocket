import { Newable } from "../structures/Newable";
import { Middleware } from "../middleware/Middleware";

export interface RouteConfig {
	path: string;
	middleware: Newable<Middleware>[];
}

export interface UserRouteConfig {
	path?: string;
	middleware?: Newable<Middleware[]>;
}
