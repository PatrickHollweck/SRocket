// NOTE: Before I get to writing proper tests use this tool: http://amritb.github.io/socketio-client-tool/
process.env["DEBUG"] = "srocket:*";

import {SRocket, ConfigBuilder} from "../../lib/src";

import {SampleMiddleware} from "./App/Middleware/SampleMiddleware";

import {ModelRoute} from "./App/Routes/ModelRoute";
import {DataRoute} from "./App/Routes/ParameterRoute";

const config = new ConfigBuilder()
	.setPort(1340)
	.build();

const srocket = new SRocket(config);

srocket.router.registerBulk(ModelRoute, DataRoute);

srocket.use(new SampleMiddleware());

srocket.listen(() => {
	console.log(`Server is listening on ${srocket.getConfig().port}`);
});
