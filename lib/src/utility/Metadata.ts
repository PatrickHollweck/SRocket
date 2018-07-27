import "reflect-metadata";

export class Metadata {
	public static getPropertyDecorator(decoratorKey: symbol, target: any, property: string) {
		return Reflect.getMetadata(decoratorKey, target, property);
	}

	public static getClassDecorator(decoratorKey: symbol, target: any) {
		return Reflect.getMetadata(decoratorKey, target);
	}
}
