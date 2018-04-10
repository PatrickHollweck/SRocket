import {MiddlewareBase} from "../../../../lib/src";

export class SampleMiddleware extends MiddlewareBase {
	private static called = false;
	beforeEventCall() {
		if (!SampleMiddleware.called) {
			console.log("Middlewares are working BTW!");
		}
	}
}