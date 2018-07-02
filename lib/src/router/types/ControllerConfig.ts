import { Middleware } from "../../middleware/Middleware";

export interface UserControllerConfig {
	prefix?: string;
	middleware?: Middleware[];
}

export interface ControllerConfig {
	prefix: string;
	middleware: Middleware[];
}
