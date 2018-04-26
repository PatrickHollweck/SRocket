import { Request, Response } from "../io";
import { RouteConfig } from "./RouteConfig";

export interface Route {
	onValidationError?(error: Error, request: Request, response: Response): Promise<void> | void;
	onError?(error: Error, request: Request, response: Response): Promise<void> | void;

	on?(request: Request, response: Response): Promise<void> | void;
	
	nested?: {
		[name: string]: NestedRoute;
	};
}

export interface NestedRoute extends Route {
	config?: RouteConfig;
}

export type FunctionalRoute = (request: Request, response: Response) => Promise<void> | void;
