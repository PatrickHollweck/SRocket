import { RouteConfig } from '../RouteConfig';
import 'reflect-metadata';

// -- RouteConfig

export const routeMetadataKey = Symbol('routeDecoratorKey');

export function RouteConfig(config: RouteConfig) {
	return (target: Function) => {
		Reflect.defineMetadata(routeMetadataKey, config, target);
	};
}

// -- NestedRoute

export const nestedRouteMetadataKey = Symbol('nestedRouteDecoratorKey');

export function NestedRoute(config: RouteConfig): Function {
	return Reflect.metadata(nestedRouteMetadataKey, config);
}