import { Response } from "../io";
import { Request } from "../io";

export abstract class Route {
	onValidationError(error: Error, request: Request, response: Response): Promise<void> | void {}

	onError(error: Error, request: Request, response: Response): Promise<void> | void {}

	before(request: Request, response: Response): Promise<void> | void {}
	on(request: Request, response: Response): Promise<void> | void {}
	after(request: Request, response: Response): Promise<void> | void {}
}
