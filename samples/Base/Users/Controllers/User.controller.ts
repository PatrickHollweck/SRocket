import { SocketRoute, Request, Response } from "../../../../lib/src/";
import { Controller } from "../../../../lib/src/router/Controller";
import { Route } from "../../../../lib/src/router";
import { jsV } from "../../../../lib/src/validation";

export class UserController extends Controller {
	
	private someClassLevelProp: string = "Hello World";
	
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
	objectRoute: Route = {
		onValidationError: (e: Error) => {
			console.log("Got validation error call to users:objectRoute", e.message);
		},
		on: (req: Request, res: Response) => {
			console.log("Got call to users:objectRoute with data", req.data);
		}
	};
	
	@SocketRoute()
	functional(req: Request, res: Response) {
		console.log("Got call to users:functional with data:", req.data);
	}
}
