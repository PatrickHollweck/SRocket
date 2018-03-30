import { RouteConfig } from "../router/RouteConfig";
import { Route } from "../router/Route";

export class InternalRoute extends Route {
	public config: RouteConfig;
	public instance: Route;

	public constructor(config: RouteConfig, instance: Route) {
		super();

		this.config = config;
		this.instance = instance;
	}

	public getInstance() {
		return this.instance;
	}

	public getRoutePath() {
		return this.config.path;
	}
}
