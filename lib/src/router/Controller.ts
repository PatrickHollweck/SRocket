import { RouteReturn } from "./Route";

export abstract class Controller {
	public $onConnect?(socket: SocketIO.Socket): RouteReturn;
	public $onDisconnect?(socket: SocketIO.Socket): RouteReturn;
}
