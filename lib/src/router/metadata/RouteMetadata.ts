import { RouteDefinition } from "./RouteDefinition";
import { InternalRoute } from "../InternalRoute";
import { RouteConfig } from "../types/RouteConfig";
import { Route } from "../Route";

export class RouteMetadata {
	public handler: InternalRoute<Route>;
	public config: RouteConfig;
	public definition: RouteDefinition;

	public constructor(
		handler: InternalRoute<Route>,
		definition: RouteDefinition,
		config: RouteConfig
	) {
		this.definition = definition;
		this.handler = handler;
		this.config = config;
	}
}
