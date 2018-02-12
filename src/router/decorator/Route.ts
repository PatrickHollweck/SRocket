import 'reflect-metadata';

const routeMetadataKey = Symbol('routeDecoratorKey');

export function RouteConfig(config: any) {
	return (target: Function) => {
		Reflect.defineMetadata(routeMetadataKey, config, target);
	};
}

export function getMetadata(target: any) {
	return Reflect.getOwnMetadata(routeMetadataKey, target);
}