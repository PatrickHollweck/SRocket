import { Middleware } from "../../middleware/Middleware";

export interface UserControllerConfig {
	prefix?: string;
	namespace?: string;
	middleware?: Middleware[];
}

export interface ControllerConfig {
	prefix: string;
	namespace: string;
	middleware: Middleware[];
}
