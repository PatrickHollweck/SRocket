import { ModuleConfig } from "../modules/ModuleConfig";

export class ServerClientInterface {}

export abstract class Controller<T extends ServerClientInterface = any> {
	public module: ModuleConfig;
	public namespace: SocketIO.Namespace;

	public $onConnect(socket: SocketIO.Socket) {}
	public $onDisconnect(socket: SocketIO.Socket) {}
}
