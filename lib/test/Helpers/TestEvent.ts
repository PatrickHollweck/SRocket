import { RouteConfig, NestedRoute } from 'src/router/decorator/Route';
import Response from 'src/interaction/Response';
import Request from 'src/interaction/Request';
import Route from 'src/router/Route';
import ValidationError from '../../src/errors/ValidationError';

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

		onValidationError(e:ValidationError, req:Request, res:Response<any>) {
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