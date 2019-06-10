process.env.DEBUG = "srocket:*";

import { SRequest, SResponse, SEvent } from "../../src";
import { SocketController } from "../../src/decorator/SocketController";
import { RouteMetadata } from "../../src/router/metadata/RouteMetadata";
import { SocketRoute } from "../../src/decorator/SocketRoute";
import { ObjectRoute } from "../../src/router/Route";
import { Middleware } from "../../src/middleware/Middleware";
import { Controller } from "../../src/router/Controller";
import { SRocket } from "../../src/start/SRocket";
import { LogLevel } from "../../src/logging/Logger";

class LoggingMiddleware extends Middleware {
	public async invoke(
		request: SRequest,
		_response: SResponse,
		route: RouteMetadata,
		next: VoidFunction
	): Promise<void> {
		console.log(
			`LOGGER: Request to : ${route.config.path} -> ${JSON.stringify(request.rawData)}`
		);

		next();
	}
}

@SocketController()
export class UserController extends Controller {
	public $onConnect(socket: SocketIO.Socket): void {
		console.log("A socket connected...", socket.id);
	}

	public $onDisconnect(socket: SocketIO.Socket): void {
		console.log("A socket disconnected...", socket.id);
	}

	@SocketRoute({
		path: "userRegister"
	})
	public objectR: ObjectRoute = {
		// tslint:disable-next-line:typedef
		on(_event: SEvent) {
			console.log("Handling register...");

			throw new Error(
				"OPPSI WOOPSI, It semz lik thr was a errwa! Our codez monkeyz are working vewy hawd to fix dis!"
			);
		},
		// tslint:disable-next-line:typedef
		onError() {
			console.log("No problem I got you... :)");
		}
	};

	@SocketRoute()
	public functional(event: SEvent): void {
		event.response.data(`Hello, ${event.request.rawData[0].name}`).to.sender.emit("test");
	}
}

// tslint:disable-next-line:no-magic-numbers
SRocket.fromPort(5555)
	.controllers(UserController)
	.setLogLevel(LogLevel.Debug)
	.addGlobalMiddleware([LoggingMiddleware], [])
	.listen(() => {
		console.log("Server started!");
	});
