import { RouteConfig } from './../RouteConfig';

import 'reflect-metadata';

// -- RouteConfig

const routeMetadataKey = Symbol('routeDecoratorKey');

export function RouteConfig(config:RouteConfig) {
	return (target:Function) => {
		Reflect.defineMetadata(routeMetadataKey, config, target);
	};
}

export function getRouteMetadata(target:any) {
	return Reflect.getMetadata(routeMetadataKey, target);
}

// -- NestedRoute

const nestedRouteMetadataKey = Symbol('nestedRouteDecoratorKey');

export function NestedRoute(config:RouteConfig) : Function {
	return Reflect.metadata(nestedRouteMetadataKey, config);
}

export function getNestedRouteMetadata(target:any, propertyKey:string) {
	return Reflect.getMetadata(nestedRouteMetadataKey, target, propertyKey);
}