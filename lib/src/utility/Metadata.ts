import 'reflect-metadata';

export default class Metadata {
	public static getPropertyDecorator(decoratorKey: Symbol, target: any, property: string) {
		return Reflect.getMetadata(decoratorKey, target, property);
	}

	public static getClassDecorator(decoratorKey: Symbol, target: any) {
		return Reflect.getMetadata(decoratorKey, target);
	}
}
