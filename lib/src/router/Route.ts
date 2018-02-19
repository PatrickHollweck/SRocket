import { RouteConfig } from 'src/router/RouteConfig';
import { NewableRoute } from 'src/router/Router';

import Response from 'src/io/Response';
import Request from 'src/io/Request';

export default abstract class Route {
	onValidationError(error: Error, request: Request<any>, response: Response<any>) { }
	before() { }
	on(request: Request<any>, response: Response<any>) { }
	after() { }
}