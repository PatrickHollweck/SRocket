import { Middleware } from "../../middleware/Middleware";

export interface UserControllerConfig {
	middleware?: Middleware[];
}

export interface ControllerConfig {
	middleware: Middleware[];
}
