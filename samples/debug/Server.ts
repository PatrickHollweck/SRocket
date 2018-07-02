process.env["DEBUG"] = "srocket:*";

import { SRocket } from "../../lib/src/start/SRocket";
import { Middleware } from "../../lib/src/middleware/Middleware";
import { SocketRoute } from "../../lib/src/decorator/SocketRoute";
import { ObjectRoute } from "../../lib/src/router/Route";
import { SocketController } from "../../lib/src/decorator/SocketController";
import { SRequest, SResponse } from "../../lib/src";
import { Controller, RouteMetadata } from "../../lib/src/router/metadata/RouteMetadataStore";

class LoggingMiddleware extends Middleware {
	call(request: SRequest, response: SResponse, route: RouteMetadata, next: Function) {
		console.log(`Request to : ${route.config.path} -> ${JSON.stringify(request.data)}`);
		next();
	}
}

@SocketController()
export class UserController extends Controller {
	$onConnect(socket: SocketIO.Socket) {
		console.log("A socket connected...", socket.id);
	}

	$onDisconnect(socket: SocketIO.Socket) {
		console.log("A socket disconnected...", socket.id);
	}

	@SocketRoute()
	functional(request: SRequest, response: SResponse) {}

	@SocketRoute({
		path: "userRegister"
	})
	objectR: ObjectRoute = {
		on(request, response) {
			console.log("Handling register...");

			throw new Error(
				"OPPSI WOOPSI, It semz lik thr was a errwa! Our codez monkeyz are working vewy hawd to fix dis!"
			);
		},
		onError(error, request, response) {
			console.log("No problem I got you... :)");
		}
	};
}

SRocket.fromPort(5555)
	.controllers(UserController)
	.addGlobalMiddleware(LoggingMiddleware)
	.listen(() => {
		console.log("Server started!");
	});
