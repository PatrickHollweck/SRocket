import { Controller } from "../../../../lib/src/router/Controller";
import { RouteConfig, Request, Response } from "../../../../lib/src/";
import { Route } from "../../../../lib/src/router";
import { jsV } from "../../../../lib/src/validation";

export class UserController extends Controller {
	@RouteConfig("addUser", {
		data: {
			userName: {
				type: String,
				rules: [{ method: jsV.contains, args: ["patrick"] }]
			}
		}
	})
	addUser = (): Route => {
		return {
			on(req: Request, res: Response) {
				console.log("Got call to users:addUser with data", req.data);
			}
		};
	};
}
