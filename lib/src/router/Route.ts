import { SEvent } from "../io/SEvent";

export type RouteReturn = Promise<void> | void;
export type Route = ObjectRoute | FunctionalRoute | ControllerMetaRoute;

export interface ObjectRoute {
	on(event: SEvent): RouteReturn;
	onError?(e: Error, event: SEvent): RouteReturn;
}

export type FunctionalRoute = (event: SEvent) => RouteReturn;
export type ControllerMetaRoute = (socket: SocketIO.Socket) => RouteReturn;
