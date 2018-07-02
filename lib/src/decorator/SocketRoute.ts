import "reflect-metadata";
import { UserRouteConfig } from "../router/types/RouteConfig";

export const SOCKET_ROUTE_METADATA_KEY = Symbol("SocketRouteMetadataKey");

export function SocketRoute(config: UserRouteConfig = {}): Function {
	return (target: Object, propertyKey: string | symbol) => {
		Reflect.defineMetadata(SOCKET_ROUTE_METADATA_KEY, config, target, propertyKey);
	};
}
