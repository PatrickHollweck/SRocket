import { RouteReturn, Route } from "./Route";

export abstract class Controller {
	$onConnect?(socket: SocketIO.Socket): RouteReturn;
	$onDisconnect?(socket: SocketIO.Socket): RouteReturn;
}
