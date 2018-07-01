import { SRequest } from "../io/SRequest";
import { SResponse } from "../io/SResponse";
import { RouteMetadata } from "../router/metadata/RouteMetadataStore";

export abstract class Middleware {
	abstract call(request: SRequest, response: SResponse, route: RouteMetadata, next: Function): void;
}
