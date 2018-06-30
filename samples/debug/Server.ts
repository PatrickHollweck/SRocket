process.env["DEBUG"] = "srocket:*";

import { Router } from "../../lib/src/router/Router";
import { container, SRequest, SResponse } from "../../lib/src";
import { SocketRoute } from "../../lib/src/decorator/SocketRoute";
import { Route, ObjectRoute } from "../../lib/src/router/Route";
import { RouteMetadataStore, Controller } from "../../lib/src/router/metadata/RouteMetadataStore";

import * as socketIO from "socket.io";
import { SRocket } from "../../lib/src/start/SRocket";

class DebugController extends Controller {
	$onConnect(socket: SocketIO.Socket) {
		console.log(socket.id, "connected!");
	}

	$onDisconnect(socket: SocketIO.Socket) {
		console.log(socket.id, "disconnected!");
	}

	@SocketRoute()
	functional(req: SRequest, res: SResponse) {
		console.log("Functional route called!", req.data);
	}

	@SocketRoute()
	objectR: Route = {
		on() {
			console.log("Object route called!");
		},
		onError(e) {
			console.log("Object route error!");
		}
	};

	@SocketRoute()
	classR = class implements ObjectRoute {
		on() {
			console.log("Class route call");
		}
		onError() {
			console.log("Error in class route!");
		}
	};
}

SRocket.fromPort(5555)
	.controllers(DebugController)
	.listen();

console.log("Server started!");
