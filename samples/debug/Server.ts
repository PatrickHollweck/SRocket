process.env["DEBUG"] = "srocket:*";

import { Router } from "../../lib/src/router/Router";
import { container } from "../../lib/src";
import { SocketRoute } from "../../lib/src/decorator/SocketRoute";
import { RouteMetadataStore, Route, ObjectRoute } from "../../lib/src/router/metadata/RouteMetadataStore";

import * as socketIO from "socket.io";

const server = socketIO(5555);
const router = new Router(server);

const store = new RouteMetadataStore();

class DebugController {
	@SocketRoute()
	functional() {
		console.log("Functional route called!");
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

store.buildController(DebugController);

container.bind(RouteMetadataStore).toConstantValue(store);

router.registerRoutes();

console.log("Server started!");