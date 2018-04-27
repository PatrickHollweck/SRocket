import { MiddlewareContext } from "./MiddlewareContext";

export abstract class MiddlewareBase {
	routeNotFound(context: MiddlewareContext) {}
	beforeEventExecution(context: MiddlewareContext) {}
	afterEventExecution(context: MiddlewareContext) {}
	onEventValidationError(context: MiddlewareContext) {}
}
