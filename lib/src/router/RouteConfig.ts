// TODO: Document this.

import ModelBase from 'src/io/Model';
import { Newable } from 'src/structures/Newable';

export type RouteConfig = {
	route: string;
	model?: Newable<ModelBase>;
	data?: {
		[arg: string]: {
			type: any;
			rules: string;
		};
	};
};