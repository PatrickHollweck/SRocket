// TODO: Document this.

export type RouteConfig = {
	route: string;
	data?: {
		[arg: string]: {
			type: any;
			rules: string;
		};
	};
};