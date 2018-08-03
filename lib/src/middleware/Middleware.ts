import { RouteMetadata } from "../router/metadata/RouteMetadata";
import { SResponse } from "../io/SResponse";
import { SRequest } from "../io/SRequest";
import { Newable } from "../structures/Newable";

export type MiddlewareList = (Newable<Middleware> | Middleware)[];

export abstract class Middleware {
	abstract invoke(
		request: SRequest,
		response: SResponse,
		route: RouteMetadata,
		next: VoidFunction
	): void;
}
