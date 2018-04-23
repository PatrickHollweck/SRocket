// NOTE: Before I get to writing proper tests use this tool: http://amritb.github.io/socketio-client-tool/
import { UserModule } from "./Users/Users.module";

process.env["DEBUG"] = "srocket:*";

import { SRocket, ConfigBuilder, Route, Request, Response, RouteConfig } from "../../lib/src";

SRocket.make(1340)
	.separationConvention("::")
	.modules(UserModule)
	.listen(app => {
		console.log(`Server is listening on ${app.config.port}`);
	});
