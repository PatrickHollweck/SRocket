import { MiddlewareList } from "../../middleware/Middleware";

export interface UserControllerConfig {
	prefix?: string;
	namespace?: string;
	beforeMiddleware?: MiddlewareList;
	afterMiddleware?: MiddlewareList;
	[index: string]: any;
}

export interface ControllerConfig {
	prefix: string;
	namespace: string;
	beforeMiddleware: MiddlewareList;
	afterMiddleware: MiddlewareList;
	[index: string]: any;
}
