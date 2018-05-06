import { ModuleConfig } from "../modules/ModuleConfig";

export class ServerClientInterface {}

export class Controller<T extends ServerClientInterface = any> {
	public module: ModuleConfig;
}
