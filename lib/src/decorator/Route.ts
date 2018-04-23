import { RouteConfig } from "../router/RouteConfig";
import "reflect-metadata";
import { Metadata } from "../utility";

// -- RouteConfig

export const routeMetadataKey = Symbol("routeDecoratorKey");

export function RouteConfig(config: RouteConfig): Function {
	return (target: Function, property: string) => {
		Reflect.defineMetadata(routeMetadataKey, config, target, property);
	};
}
