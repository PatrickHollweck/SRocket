import { SRequest } from "./SRequest";
import { SResponse } from "..";

import * as t from "io-ts";

export class SEvent<TRequest = any, TResponse = any> {
	public readonly request: SRequest<TRequest>;
	public readonly response: SResponse<TResponse>;

	public readonly v = t;
	public static readonly V = t;

	constructor(request: SRequest<TRequest>, response: SResponse<TResponse>) {
		this.request = request;
		this.response = response;
	}
}
