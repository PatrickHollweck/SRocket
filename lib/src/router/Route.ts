export type RouteReturn = Promise<void> | void;

export interface ObjectRoute {
	on(): RouteReturn;
	onError?(e: Error): RouteReturn;
}

export type FunctionalRoute = () => RouteReturn;

export type Route = ObjectRoute | FunctionalRoute;
