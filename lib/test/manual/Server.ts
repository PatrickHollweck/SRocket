process.env["DEBUG"] = "srocket:*";

import { SRocket } from "../../src/start/SRocket";
import { Middleware } from "../../src/middleware/Middleware";
import { SocketRoute } from "../../src/decorator/SocketRoute";
import { ObjectRoute } from "../../src/router/Route";
import { SocketController } from "../../src/decorator/SocketController";
import { SRequest, SResponse } from "../../src";
import { Controller, RouteMetadata } from "../../src/router/metadata/RouteMetadataStore";

import {
	joi,
	Validate,
	JoiValidationMiddleware
} from "../../../addons/middleware-validation-joi/JoiValidationMiddleware";

class LoggingMiddleware extends Middleware {
	invoke(request: SRequest, response: SResponse, route: RouteMetadata, next: VoidFunction) {
		console.log(`LOGGER: Request to : ${route.config.path} -> ${JSON.stringify(request.data)}`);
		next();
	}
}

@SocketController({
	beforeMiddleware: [JoiValidationMiddleware]
})
export class UserController extends Controller {
	$onConnect(socket: SocketIO.Socket) {
		console.log("A socket connected...", socket.id);
	}

	$onDisconnect(socket: SocketIO.Socket) {
		console.log("A socket disconnected...", socket.id);
	}

	@SocketRoute({
		path: "userRegister"
	})
	objectR: ObjectRoute = {
		on() {
			console.log("Handling register...");

			throw new Error(
				"OPPSI WOOPSI, It semz lik thr was a errwa! Our codez monkeyz are working vewy hawd to fix dis!"
			);
		},
		onError() {
			console.log("No problem I got you... :)");
		}
	};

	@SocketRoute()
	@Validate(
		joi.array().items(
			joi.object().keys({
				name: joi.string()
			}),
			joi.func().required()
		)
	)
	functional(request: SRequest, response: SResponse) {
		console.log("functional Handler!", request.data[0].name);
	}
}

SRocket.fromPort(5555)
	.controllers(UserController)
	.addGlobalMiddleware([LoggingMiddleware], [])
	.listen(() => {
		console.log("Server started!");
	});
