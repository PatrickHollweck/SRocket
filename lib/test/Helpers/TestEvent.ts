import { RouteConfig, NestedRoute } from 'src/decorator/Route';
import Response from 'src/io/Response';
import Request from 'src/io/Request';
import Route from 'src/router/Route';

export type RouteCallback = (request:Request) => {};

@RouteConfig({
	route: '/test'
})
export class TestEvent {

	@NestedRoute({
		route: '/data',
		data: {
			str: String,
		}
	})
	dataRoute = class extends Route {

		onValidationError(e:Error, req:Request, res:Response<any>) {
			res.data({
				validationError: true,
			}).toAllInNamespace();
		}

		on(data, req:Request, res:Response<any>) {
			res.data({
				validationError: false,
			}).toAllInNamespace();
		}
	};

	@NestedRoute({
		route: '/nested'
	})
	nestedRoute = class extends Route {
		on(data, req:Request, res:Response<any>) {
			res.toAllInNamespace();
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
			on(data, req:Request, res:Response<any>) {
				res.relay();
			}
		};

		on(data, req:Request, res:Response<any>) {
			res.relay();
		}
	};

	on(data, req:Request, res:Response<any>) {
		res.toAllInNamespace('/');
	}
}