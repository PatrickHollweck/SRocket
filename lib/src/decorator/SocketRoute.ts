import { UserRouteConfig, RouteConfig } from "../router/deprecated/RouteConfig";
import "reflect-metadata";

export const routeMetadataKey = Symbol("routeDecoratorKey");

export function SocketRoute(config: UserRouteConfig = {}): Function {
	return (target: Function, property: string) => {
		const actualConfig: RouteConfig = {
			path: config.path || property,
			data: config.data,
			model: config.model
		};

		Reflect.defineMetadata(routeMetadataKey, actualConfig, target, property);
	};
}
