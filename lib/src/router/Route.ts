import { SEvent } from "../io/SEvent";
import { SRequest } from "../io/SRequest";
import { SResponse } from "../io/SResponse";

export type RouteReturn = Promise<void> | void;

export interface ObjectRoute {
	on(event: SEvent): RouteReturn;
	onError?(e: Error, event: SEvent): RouteReturn;
}

type EventRoute = (event: SEvent) => RouteReturn;
type ReqResRoute = (request: SRequest, response: SResponse) => RouteReturn;
export type FunctionalRoute = EventRoute | ReqResRoute;

export type ControllerMetaRoute = (socket: SocketIO.Socket) => RouteReturn;

export type Route = ObjectRoute | FunctionalRoute | ControllerMetaRoute;
