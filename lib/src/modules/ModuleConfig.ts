import { Controller } from "../router/Controller";
import { Newable } from "../structures/Newable";

export type ModuleConfig = {
	namespace: string;
	controllers: Newable<Controller>[];
};
