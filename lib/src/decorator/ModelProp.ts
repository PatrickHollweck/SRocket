import { Newable } from "../structures/Newable";

export function ModelProp(): PropertyDecorator {
	return (target: object, propertyKey: any): void => {
		const props = target.hasOwnProperty("__props__")
			? (target as any)["__props__"]
			: ((target as any)["__props__"] = []);
		props.push(propertyKey);
	};
}

export function getModelProps(obj: Newable<any>): string[] {
	const result: string[] = [];
	let prototype = obj.prototype;
	while (prototype !== null) {
		const props: string[] = prototype["__props__"];
		if (props) {
			result.push(...props);
		}
		prototype = Object.getPrototypeOf(prototype);
	}
	return result;
}
