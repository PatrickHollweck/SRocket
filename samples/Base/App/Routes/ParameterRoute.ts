import {jsV, Request, Response, Route, RouteConfig} from "../../../../lib/src";
import {GetUserDataRequest} from "../Models/GetUserDataModel";

@RouteConfig({
	path: "/param",
	data: {
		userName: {
			type: String,
			rules: [
				{
					method: jsV.contains,
					args: ["patrick"],
					message: 'The $property did not contain "$arg1"'
				}
			]
		}
	}
})
export class DataRoute extends Route {
	onError(e: Error, req: Request, res: Response) {
		console.log('Internal Error caught in "/param" -> ', e.message);
	}

	onValidationError(error: Error) {
		console.log('"/param" -> Validation error caught!', error.message);
	}

	on(req: Request<GetUserDataRequest>, res: Response) {
		res
			.eventName("some-event")
			.withData({ hello: "world" })
			.relay();

		console.log("GOT CALL TO: /param -> with: ", req.data);
	}
}