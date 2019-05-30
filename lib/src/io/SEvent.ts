import { SRequest } from "./SRequest";
import { SResponse } from "..";

export class SEvent<TRequest = any, TResponse = any> {
	public readonly request: SRequest<TRequest>;
	public readonly response: SResponse<TResponse>;

	constructor(request: SRequest<TRequest>, response: SResponse<TResponse>) {
		this.request = request;
		this.response = response;
	}
}
