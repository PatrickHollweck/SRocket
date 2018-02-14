import { RouteConfig } from './RouteConfig';
import { NewableRoute } from './Router';

import ValidationError from '../Exceptions/ValidationError';
import Response from '../interaction/Response';
import Request from '../interaction/Request';

export default abstract class Route {
	onValidationError(error:ValidationError) {}
	before() {}
	on(args:object, request:Request, response:Response<any>) {}
	after() {}
}