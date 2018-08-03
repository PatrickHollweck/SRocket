import { MiddlewareList } from "../../middleware/Middleware";

export interface RouteConfig {
	path: string;
	beforeMiddleware: MiddlewareList;
	afterMiddleware: MiddlewareList;
	[index: string]: any;
}

export interface UserRouteConfig {
	path?: string;
	beforeMiddleware?: MiddlewareList;
	afterMiddleware?: MiddlewareList;
	[index: string]: any;
}
