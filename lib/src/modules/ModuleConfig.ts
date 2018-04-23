import { Controller } from "../router/Controller";

export type ModuleConfig = {
	namespace: string;
	controllers: Controller[];
}