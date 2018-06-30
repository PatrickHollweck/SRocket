export type RouteReturn = Promise<void> | void;

export interface ObjectRoute {
	on(): RouteReturn;
	onError?(e: Error): RouteReturn;
}

export type FunctionalRoute = () => Promise<void> | void;

export type Route = ObjectRoute | FunctionalRoute;
