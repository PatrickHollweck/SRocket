import "reflect-metadata";
import { RouteConfig, UserRouteConfig } from "../router/RouteConfig";

export const SOCKET_ROUTE_METADATA_KEY = Symbol("SocketRouteMetadataKey");

export function SocketRoute(config: UserRouteConfig = {}): Function {
	return (target: Object, propertyKey: string | symbol) => {
		const realConfig: RouteConfig = {
			path: config.path || ""
		};

		Reflect.defineMetadata(SOCKET_ROUTE_METADATA_KEY, realConfig, target, propertyKey);
	};
}
