import { UserRouteConfig, RouteConfig } from "../router/RouteConfig";
import "reflect-metadata";

export const routeMetadataKey = Symbol("routeDecoratorKey");

export function RouteConfig(routePath: string, config: UserRouteConfig = {}): Function {
	return (target: Function, property: string) => {
		const actualConfig: RouteConfig = {
			path: routePath,
			data: config.data,
			model: config.model
		};
		
		Reflect.defineMetadata(routeMetadataKey, actualConfig, target, property);
	};
}