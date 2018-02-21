// TODO: Document this.

import { RulesObj } from './../validation/Validator';
import { Newable } from 'src/structures/Newable';

import Model from 'src/io/model/Model';

export type RouteConfig = {
	route: string;
	model?: Newable<Model>;
	data?: {
		[arg: string]: {
			type: any;
			rules?: string;
			rulesObj?: RulesObj;
		};
	};
};