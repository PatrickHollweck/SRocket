import 'reflect-metadata';

export const modelPropMetadataKey = Symbol('modelPropDecoratorKey');

export default function Model(): Function {
	return function (target: any) {
		return Reflect.defineMetadata(modelPropMetadataKey, target, target);
	};
}