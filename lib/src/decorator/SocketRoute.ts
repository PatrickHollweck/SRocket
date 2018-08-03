import "../../../addons/middleware-validation-joi/node_modules/reflect-metadata";
import { UserRouteConfig } from "../router/types/RouteConfig";

export const SOCKET_ROUTE_METADATA_KEY = Symbol("SocketRouteMetadataKey");

export function SocketRoute(config: UserRouteConfig = {}): PropertyDecorator {
	return (target: object, propertyKey: string | symbol) => {
		Reflect.defineMetadata(SOCKET_ROUTE_METADATA_KEY, config, target, propertyKey);
	};
}
