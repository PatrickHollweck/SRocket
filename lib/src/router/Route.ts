import { RouteConfig } from "../router/RouteConfig";
import { NewableRoute } from "../router/Router";

import { Response } from "../io/Response";
import { Request } from "../io/Request";

export abstract class Route {
	onValidationError(
		error: Error,
		request: Request,
		response: Response
	): Promise<void> | void {}

	onError(
		error: Error,
		request: Request,
		response: Response
	): Promise<void> | void {}

	before(request: Request, response: Response): Promise<void> | void {}
	on(request: Request, response: Response): Promise<void> | void {}
	after(request: Request, response: Response): Promise<void> | void {}
}
