import "reflect-metadata";
import { UserControllerConfig } from "../router/types/ControllerConfig";

export const SOCKET_CONTROLLER_METADATA_KEY = Symbol("SocketRouteMetadataKey");

export function SocketController(config: UserControllerConfig = {}): ClassDecorator {
	return (target: object) => {
		Reflect.defineMetadata(SOCKET_CONTROLLER_METADATA_KEY, config, target);
	};
}
