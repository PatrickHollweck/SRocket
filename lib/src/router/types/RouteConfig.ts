import { Newable } from "../../structures/Newable";
import { Middleware } from "../../middleware/Middleware";

export interface RouteConfig {
	path: string;
	beforeMiddleware: Newable<Middleware>[];
	afterMiddleware: Newable<Middleware>[];
}

export interface UserRouteConfig {
	path?: string;
	beforeMiddleware?: Newable<Middleware>[];
	afterMiddleware?: Newable<Middleware>[];
}
