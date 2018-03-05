import { RouteConfig } from 'src/router/RouteConfig';
import { NewableRoute } from 'src/router/Router';

import Response from 'src/io/Response';
import Request from 'src/io/Request';

export default abstract class Route {
	onValidationError(error: Error, request: Request, response: Response) { }
	onError(error: Error, request: Request, response: Response) { }

	before(request: Request, response: Response) { }
	on(request: Request, response: Response) { }
	after(request: Request, response: Response) { }
}