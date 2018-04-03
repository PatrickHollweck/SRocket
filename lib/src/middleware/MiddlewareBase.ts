import {MiddlewareContext} from "./MiddlewareContext";

export abstract class MiddlewareBase {
	onEventValidationError(context: MiddlewareContext) {}
	routeNotFound(context: MiddlewareContext) {}
	beforeEventCall(context: MiddlewareContext) {}
	afterEventCall(context: MiddlewareContext) {}
}