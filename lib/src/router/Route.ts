import { SRequest } from "../io/SRequest";
import { SResponse } from "../io/SResponse";

export type RouteReturn = Promise<void> | void;
export type Route = ObjectRoute | FunctionalRoute | ControllerMetaRoute;

export interface ObjectRoute {
	on(req: SRequest, res: SResponse): RouteReturn;
	onError?(e: Error): RouteReturn;
}

export type FunctionalRoute = (req: SRequest, res: SResponse) => RouteReturn;
export type ControllerMetaRoute = (socket: SocketIO.Socket) => RouteReturn;
