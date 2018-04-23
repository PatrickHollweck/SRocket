import { Controller } from "../../../../lib/src/router/Controller";
import { RouteConfig, Request, Response } from "../../../../lib/src/";
import { Route } from "../../../../lib/src/router";

export class UserController extends Controller {
	public xd: string = "Hello world";
	
	@RouteConfig({
		path: "addUser"
	})
	addUser = class extends Route {
		on(req: Request, res: Response) {
			console.log("Got request to user::addUser with data", req.data);
		}
	}
}