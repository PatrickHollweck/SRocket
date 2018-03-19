// TODO: Document this.

import { Newable } from '../structures/Newable';
import { Model } from '../model/Model';

// This does not belong here ?
export type RuleType = {
	[key: string]: {
		type: any;
		rules?: Array<{
			rule: Function;
			args?: Array<any>;
			message?: string;
		}>;
	};
};

export type RouteConfig = {
	route: string;
	model?: Newable<Model>;
	data?: RuleType;
};