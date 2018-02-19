import 'reflect-metadata';

export default class Metadata {
	public static getPropertyDecorator(decoratorKey: Symbol, target: any, propertyKey: string) {
		return Reflect.getMetadata(decoratorKey, target, propertyKey);
	}

	public static getClassDecorator(decoratorKey: Symbol, target: any) {
		return Reflect.getMetadata(decoratorKey, target);
	}
}