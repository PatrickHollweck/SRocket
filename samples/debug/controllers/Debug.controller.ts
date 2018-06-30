import { Controller } from "../../../lib/src/router/metadata/RouteMetadataStore";
import { SocketRoute } from "../../../lib/src/decorator/SocketRoute";
import { ObjectRoute, Route } from "../../../lib/src/router/Route";
import { SRequest, SResponse } from "../../../lib/src";

export class DebugController extends Controller {
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
