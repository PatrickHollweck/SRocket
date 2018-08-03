import { Controller } from "../Controller";
import { Route } from "../Route";

export interface RouteDefinition {
	controller: Controller;
	route: Route;
	property: string;
}
