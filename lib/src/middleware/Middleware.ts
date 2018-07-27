import { SRequest } from "../io/SRequest";
import { SResponse } from "../io/SResponse";
import { RouteMetadata } from "../router/metadata/RouteMetadataStore";

export abstract class Middleware {
	abstract invoke(request: SRequest, response: SResponse, route: RouteMetadata, next: () => void): void;
}
