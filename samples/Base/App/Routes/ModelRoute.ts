import {Request, Response, Route, RouteConfig} from "../../../../lib/src";
import {GetUserDataRequest} from "../Models/GetUserDataModel";

@RouteConfig({
	path: "/model",
	model: GetUserDataRequest
})
export class ModelRoute extends Route {
	onValidationError(error: Error) {
		console.log('"/model -> Validation error caught!', error.message);
	}

	on(req: Request<GetUserDataRequest>, res: Response) {
		console.log("GOT CALL TO: /model -> with: ", req.data);
	}
}