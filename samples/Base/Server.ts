process.env["DEBUG"] = "srocket:*";

import {
	SRocket,
	ConfigBuilder,
	ModelProp,
	tsV,
	jsV,
	RouteConfig,
	Request,
	Response,
	Route,
	Model,
	MiddlewareBase,
	NestedRoute
} from "../../lib/src/index";

import { createHandyClient } from "handy-redis";

// NOTE: Before I get to writing proper tests use this tool: http://amritb.github.io/socketio-client-tool/

const config = new ConfigBuilder().setPort(1340).build();

const srocket = new SRocket(config);

class ModelRequest extends Model {
	@ModelProp()
	@tsV.IsDefined({ message: "The userName must be defined!" })
	@tsV.IsNotEmpty({ message: "The userName must not be empty!" })
	@tsV.IsString({ message: "The userName must be a string" })
	public userName: string;
}

@RouteConfig({
	path: "/model",
	model: ModelRequest
})
class ModelRoute extends Route {
	onValidationError(error: Error) {
		console.log('"/model -> Validation error caught!', error.message);
	}

	on(req: Request<ModelRequest>, res: Response) {
		console.log("GOT CALL TO: /model -> with: ", req.data);
	}
}

@RouteConfig({
	path: "/param",
	data: {
		userName: {
			type: String,
			rules: [
				{
					method: jsV.contains,
					args: ["patrick"],
					message: 'The $property did not contain "$arg1"'
				}
			]
		}
	}
})
class DataRoute extends Route {
	onError(e: Error, req: Request, res: Response) {
		console.log('Internal Error caught in "/param" -> ', e.message);
	}

	onValidationError(error: Error) {
		console.log('"/param" -> Validation error caught!', error.message);
	}

	on(req: Request<ModelRequest>, res: Response) {
		res
			.eventName("some-event")
			.withData({ hello: "world" })
			.relay();

		console.log("GOT CALL TO: /param -> with: ", req.data);
	}
}

class SampleMiddleware extends MiddlewareBase {
	private static called = false;
	beforeEventCall() {
		if (!SampleMiddleware.called) {
			console.log("Middlewares are working BTW!");
		}
	}
}

srocket.router.registerBulk(ModelRoute, DataRoute);

srocket.use(new SampleMiddleware());

srocket.listen(() => {
	console.log(`Server is listening on ${srocket.getConfig().port}`);
});
