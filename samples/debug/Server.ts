process.env["DEBUG"] = "srocket:*";

import { Router } from "../../lib/src/router/Router";
import { SRocket } from "../../lib/src/start/SRocket";
import { Middleware } from "../../lib/src/middleware/Middleware";
import { IAutoloader } from "autoloader-ts";
import { SocketRoute } from "../../lib/src/decorator/SocketRoute";
import { Route, ObjectRoute } from "../../lib/src/router/Route";
import { container, SRequest, SResponse } from "../../lib/src";
import { Controller, RouteMetadata } from "../../lib/src/router/metadata/RouteMetadataStore";

SRocket.fromPort(5555)
	.autoloadControllers(async loader => {
		await loader.fromDirectories(`${__dirname}/controllers`);
	})
	.listen();

console.log("Server started!");
