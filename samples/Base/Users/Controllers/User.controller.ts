import { Request, SocketRoute } from "../../../../lib/src/";
import { Controller, Route } from "../../../../lib/src/router";
import { Namespace } from "../../../../lib/src/decorator/Namespace";
import { jsV } from "../../../../lib/src/validation";

export class UserController extends Controller {
	@Namespace() private namespace: SocketIO.Namespace;

	@SocketRoute({
		data: {
			userName: {
				type: String,
				rules: [{ method: jsV.contains, args: ["Patrick"] }]
			}
		}
	})
	objectRoute: Route = {
		onError: (e: Error) => {
			console.log("Error in users:objectRoute ->", e);
		},
		onValidationError: (e: Error) => {
			console.log("Got validation error call to users:objectRoute ->", e.message);
		},
		on: (req: Request) => {
			console.log("Namepace name from property: ", this.namespace.name);
			console.log("Got call to users:objectRoute with data:", req.data);
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
