import { RouteConfig } from '../router/RouteConfig';
import { NewableRoute } from '../router/Router';

import { Response } from '../io/Response';
import { Request } from '../io/Request';

export abstract class Route {
	onValidationError(error: Error, request: Request, response: Response) { }
	onError(error: Error, request: Request, response: Response) { }

	before(request: Request, response: Response) { }
	on(request: Request, response: Response) : void | Promise<void> { }
	after(request: Request, response: Response) { }
}