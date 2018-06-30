import { SRequest } from "../io/SRequest";
import { SResponse } from "../io/SResponse";

export abstract class Middleware {
	abstract call(req: SRequest, res: SResponse, next: Function): void;
}
