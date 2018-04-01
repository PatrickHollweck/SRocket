// TODO: Document this.

import { Newable } from "../structures/Newable";
import { Model } from "../model/Model";
import { RuleSchema } from "../validation/Validator";

export type RouteConfig = {
	path: string;
	model?: Newable<Model>;
	data?: RuleSchema;
};
