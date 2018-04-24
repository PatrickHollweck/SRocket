import { Request, Response } from "../io";

export interface Route {
	onValidationError?(error: Error, request: Request, response: Response): Promise<void> | void;
	onError?(error: Error, request: Request, response: Response): Promise<void> | void;

	before?(request: Request, response: Response): Promise<void> | void;
	on?(request: Request, response: Response): Promise<void> | void;
	after?(request: Request, response: Response): Promise<void> | void;
}
