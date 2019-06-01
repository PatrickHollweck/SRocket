import { SRequest } from "./SRequest";
import { SResponse } from "..";

import * as t from "io-ts";

export class SEvent<TRequest = any, TResponse = any> {
	public readonly request: SRequest<TRequest>;
	public readonly response: SResponse<TResponse>;

	/**
	 * The IO-TS validation library
	 * Use this member as a shorthand to access it,
	 * Used to define the schema for the `SRequest.validation` functions
	 *
	 * docs: https://github.com/gcanti/io-ts
	 *
	 * @memberof SEvent
	 */
	public readonly v = t;

	/**
	 * The IO-TS validation library
	 * Use this member as a shorthand to access it,
	 * Used to define the schema for the `SRequest.validation` functions
	 *
	 * docs: https://github.com/gcanti/io-ts
	 *
	 * @static
	 * @memberof SEvent
	 */
	public static readonly V = t;

	constructor(request: SRequest<TRequest>, response: SResponse<TResponse>) {
		this.request = request;
		this.response = response;
	}
}
