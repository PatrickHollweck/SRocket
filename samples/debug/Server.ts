process.env["DEBUG"] = "srocket:*";

import { Router } from "../../lib/src/router/Router";

import * as socketIO from "socket.io";
import { container } from "../../lib/src";
import { RouteMetadataStore } from "../../lib/src/router/metadata/RouteMetadataStore";
import { SocketRoute } from "../../lib/src/decorator/SocketRoute";

const server = socketIO(5555);
const router = new Router(server);

const store = new RouteMetadataStore();

class UserController {
	@SocketRoute()
	login() {
		console.log("Hello World");
	}
}

store.buildController(UserController);

container.bind(RouteMetadataStore).toConstantValue(store);

router.registerRoutes();

console.log("Server started!");
