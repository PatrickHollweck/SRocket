// NOTE: Before I get to writing proper tests use this tool: http://amritb.github.io/socketio-client-tool/
process.env["DEBUG"] = "srocket:*";

import { SRocket, ConfigBuilder, Route, Request, Response, RouteConfig } from "../../lib/src";

const config = new ConfigBuilder()
	.setPort(1340)
	.build();

const srocket = new SRocket(config);

@RouteConfig({
	path: "test"
})
class TestRoute extends Route {
	on(req: Request, res: Response)	{
		console.log("Got call to 'test' with data", req.data);
	}
}

srocket.router.routes.register(TestRoute);

srocket.listen(() => {
	console.log(`Server is listening on ${srocket.getConfig().port}`);
});
