import { SRequest } from "./SRequest";
import { SResponse } from "..";

export class SEvent<T = any> {
	public readonly request: SRequest<T>;
	public readonly response: SResponse<T>;

	constructor(request: SRequest<T>, response: SResponse<T>) {
		this.request = request;
		this.response = response;
	}
}
