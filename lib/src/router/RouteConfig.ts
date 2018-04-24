// TODO: Document this.

import { RuleSchema } from "../validation/Validator";
import { Newable } from "../structures/Newable";
import { Model } from "../model";

export type RouteConfig = {
	path: string;
	model?: Newable<Model>;
	data?: RuleSchema;
};

export type UserRouteConfig = {
	model?: Newable<Model>;
	data?: RuleSchema;
}