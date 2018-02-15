import { RouteConfig } from 'src/router/RouteConfig';
import { NewableRoute } from 'src/router/Router';

import ValidationError from 'src/errors/ValidationError';
import Response from 'src/interaction/Response';
import Request from 'src/interaction/Request';

export default abstract class Route {
	onValidationError(error:ValidationError, request:Request, response:Response<any>) {}
	before() {}
	on(args:object, request:Request, response:Response<any>) {}
	after() {}
}