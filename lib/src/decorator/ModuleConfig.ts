import { ModuleConfig } from "../modules/ModuleConfig";
import "reflect-metadata";
import { Metadata } from "../utility";

export const moduleMetadataKey = Symbol("moduleMetadataKey");

export function ModuleConfig(config: ModuleConfig): Function {
	return (target: Function) => {
		Reflect.defineMetadata(moduleMetadataKey, config, target);
	}
}

export function getModuleConfigDecorator(target: any): ModuleConfig | null {
	return Metadata.getClassDecorator(moduleMetadataKey, target);
}