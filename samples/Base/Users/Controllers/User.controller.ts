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
	addUser = (): Route => {
		return {
			onValidationError(e: Error) {
				console.log("Got validation error call to users:addUser", e.message);
			},
			on(req: Request, res: Response) {
				console.log("Got call to users:addUser with data", req.data);
			}
		};
	};
}
