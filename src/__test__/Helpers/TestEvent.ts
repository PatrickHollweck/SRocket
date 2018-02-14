import { RouteConfig, NestedRoute } from '../../router/decorator/Route';
import Response from '../../interaction/Response';
import Request from '../../interaction/Request';
import Route from '../../router/Route';

export type RouteCallback = (request:Request) => {};

@RouteConfig({
	route: '/test'
})
export class TestEvent {

	@NestedRoute({
		route: '/nested'
	})
	nestedRoute = class extends Route {
		on(req:Request, res:Response<any>) {
			res.toAllInNamespace('/');
		}
	};

	@NestedRoute({
		route: '/doubleNested'
	})
	doubleNestedRoute = class extends Route {

		@NestedRoute({
			route: '/nest'
		})
		nestedNestedRoute = class extends Route {
			on(req:Request, res:Response<any>) {
				res.relay();
			}
		};

		on(req:Request, res:Response<any>) {
			res.relay();
		}
	};

	on(req:Request, res:Response<any>) {
		res.toAllInNamespace('/');
	}
}