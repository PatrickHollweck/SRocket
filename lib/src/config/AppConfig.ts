import { Middleware } from "../middleware/Middleware";

export class AppConfig {
	public globalMiddleware: Middleware[];

	constructor() {
		this.globalMiddleware = [];
	}
}
