import { RouteConfig } from './RouteConfig';
import { NewableRoute } from './Router';

export default abstract class Route {

	private nestedRoutes : Array<NewableRoute<NestedRoute>>;

	constructor() {
		this.nestedRoutes = new Array<NewableRoute<NestedRoute>>();
	}

	before(socket: SocketIOExt.Socket) {}
	on(socket: SocketIOExt.Socket) {}
	after(socket: SocketIOExt.Socket) {}

	public getNestedRoutes() {
		return this.nestedRoutes;
	}

	protected addNestedRoute(route:NewableRoute<NestedRoute>) {
		this.nestedRoutes.push(route);
	}

}

export abstract class NestedRoute extends Route {
	public abstract config:RouteConfig;
}