// TODO: Document this.

import { Newable } from 'src/structures/Newable';
import Model from 'src/io/model/Model';

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