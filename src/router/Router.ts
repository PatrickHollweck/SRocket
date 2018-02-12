import * as RouteDecorator from './decorator/Route';
import Route from './Route';

type RouteConfig = {
	route:string;
};

class InternalRoute extends Route {
	public config:RouteConfig;

	public constructor() {
		super();
	}
}

export default class Router {
	private routes:Route[];

	public constructor() {
		this.routes = new Array<Route>();
	}

	public register(route:{ new(...args: any[]): Route }) {
		const routeConfig = RouteDecorator.getMetadata(route);
		if(!routeConfig) {
			throw new Error(`The Route ${route} must have a @RouteConfig decorator!`);
		}

		this.routes.push(new InternalRoute());
	}
}