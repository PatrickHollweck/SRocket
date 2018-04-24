import { SocketRoute, Request, Response } from "../../../../lib/src/";
import { Controller } from "../../../../lib/src/router/Controller";
import { Route } from "../../../../lib/src/router";
import { jsV } from "../../../../lib/src/validation";

export class UserController extends Controller {
	@SocketRoute({
		data: {
			userName: {
				type: String,
				rules: [{
					method: jsV.contains, args: ["Patrick"]
				}]
			}
		}
	})
	// TODO: Allow for shorthand handlers like addUser() { [code] }
	lambda = (): Route => ({
		onValidationError(e: Error) {
			console.log("Got validation error call to users:lambda", e.message);
		},
		on(req: Request, res: Response) {
			console.log("Got call to users:lambda with data", req.data);
		}
	});
	
	@SocketRoute()
	classRoute = class implements Route {
		on(req: Request) {
			console.log("Got call to users:classRoute with data:", req.data);
		}
	}
}
