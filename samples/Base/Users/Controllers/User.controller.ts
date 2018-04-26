import { SocketRoute, Request, Response } from "../../../../lib/src/";
import { Controller } from "../../../../lib/src/router/Controller";
import { Route } from "../../../../lib/src/router";
import { NestedRoute } from "../../../../lib/src/router/Route";
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
	objectRoute: Route = {
		onValidationError: (e: Error) => {
			console.log("Got validation error call to users:objectRoute", e.message);
		},
		on: (req: Request) => {
			console.log("Got call to users:objectRoute with data", req.data);
		},
		nested: {
			nestedRoute: {
				on: (req: Request) => {
					console.log("Got call to users:objectRoute:nestedRoute with data:", req.data);
				},
				nested: {
					helloWorld: {
						on: (req: Request) => {
							console.log("Got call to users:objectRoute:nestedRoute:helloWorld with data:", req.data);
						}
					}
				}
			}
		}
	};
	
	@SocketRoute()
	functional(req: Request) {
		console.log("Got call to users:functional with data:", req.data);
	}
	
	@SocketRoute()
	classR = class implements Route {
		nested = {
			nestedClass: {
				on(req: Request) {
					console.log("Got call to users:classR:nestedClass with data:", req.data);
				}
			}
		};

		on(req: Request) {
			console.log("Got call to users:classR with data:", req.data);
		}
	};
}
