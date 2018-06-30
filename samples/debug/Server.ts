process.env["DEBUG"] = "srocket:*";

import { Router } from "../../lib/src/router/Router";
import { SRocket } from "../../lib/src/start/SRocket";
import { Autoloader } from "autoloader-ts";
import { SocketRoute } from "../../lib/src/decorator/SocketRoute";
import { Route, ObjectRoute } from "../../lib/src/router/Route";
import { container, SRequest, SResponse } from "../../lib/src";
import { RouteMetadataStore, Controller } from "../../lib/src/router/metadata/RouteMetadataStore";

import * as socketIO from "socket.io";

SRocket.fromPort(5555)
	.autoloadControllers(async loader => {
		await loader.fromDirectories(`${process.cwd()}/samples/debug/controllers`);
	})
	.listen();

console.log("Server started!");
