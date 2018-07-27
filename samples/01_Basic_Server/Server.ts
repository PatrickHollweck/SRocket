// This line enables the logger for srocket -- https://www.npmjs.com/package/debug
process.env["DEBUG"] = "srocket:*";

/*
 * Before you start!
 *
 * Make sure you know the basics of: Typescript, Node and Socket.io
 */

import { SRocket } from "../../lib/src/start/SRocket";
import { Controller } from "../../lib/src/router/metadata/RouteMetadataStore";
import { SocketRoute } from "../../lib/src/decorator/SocketRoute";
import { SRequest, SResponse } from "../../lib/src";
import { SocketController } from "../../lib/src/decorator/SocketController";
import { ObjectRoute } from "../../lib/src/router/Route";

/*
 * In SRocket most things are designed to work with Controllers,
 * Controllers are nothing more than a container for your routes.
 *
 * A controller should extend from the "Controller" class and have
 * a @SocketContoller decorator. Both of these give you type-safety
 * and configuration options.
 *
 * The Controller predefines 2 special methods.
 * $onConnect -> Called when a socket connects to the namespace
 * $onDisconnect -> Called when a socket disconnects from a namespace
 *
 */

@SocketController(/* Optional Config */)
export class UserController extends Controller {
	$onConnect(socket: SocketIO.Socket) {
		console.log("A socket connected...", socket.id);
	}

	$onDisconnect(socket: SocketIO.Socket) {
		console.log("A socket disconnected...", socket.id);
	}

	/*
	 * This is a "route"
	 *
	 * It is a so called functional route, meaning it is just a function.
	 * There are other types of routes... They will be demonstrated later.
	 *
	 * Every route has a @SocketRoute decorator! If not, they wont be registered...
	 * The decorator can define metadata about the route. For example:
	 * - The middlewares it should apply.
	 * - The path to the route ( by default the name of the function )
	 * - Validation of the data
	 *
	 * Every route also recieves 2 arguments:
	 * - A "SRequest" -> Object simular to the "express.js" request object
	 * - A "SResponse" -> Object siumlar to the "express.js" response object
	 * (
	 * SRequest and SResponse are prefixed with S because Node already has
	 * Request and Response objects built-in. Meaning you could accidentally
	 * use them instead of the objects defined by SRocket!
	 * )
	 *
	 * The lib is written in typescript, so you can use "intellisense" to
	 * find out more about the mehods on objects.
	 */

	@SocketRoute(/* Optional Config */)
	login(request: SRequest, response: SResponse) {
		// Logs the data that came with the request.
		console.log(request.data);

		// Respond to the sender with the specified data.
		response
			.withData({
				message: `Hello ${request.data.name}`
			})
			.toSender();
	}

	/*
	 * This is a so called "ObjectRoute" it is a route with some more functionallity.
	 * It can define a "onError" method for example, which you can use to handle errors.
	 *
	 * Internally every route is converted to a ObjectRoute, but for most cases you only
	 * need the "on" function, this is why functional-Routes exist.
	 *
	 * This route also demonstrates the decorator configuration. In this example we are
	 * overriding the path of the route. Normally the name of the function or route is
	 * taken for the route path, in this case "register", but sometimes you may want to
	 * override that, so we provided a option to do just that -> We override the path
	 * with "userRegister" :)
	 */
	@SocketRoute({
		path: "userRegister"
	})
	register: ObjectRoute = {
		on(request, response) {
			console.log("Handling register...");

			throw new Error(
				"OPPSI WOOPSI, It semz lik thr was a errwa! Our codez monkeyz are working vewy hawd to fix dis!"
			);
		},
		onError(error, request, response) {
			console.log("No problem I got you... :)");
		}
	};
}

/*
 * You will start all of your SRocket apps, via this "Starter" class.
 * It has some properties that make it easy to configure most of the things.
 *
 * You can choose to make a srocket app from a existing socketio-server or let
 * srocket take care of the instantiation.
 *
 * In this case we dont have a existing server, so we let srocket take care of
 * the setup and just specify the port (and optionally the socket.io options)
 *
 * From there we get a "srocket" instance, and you can start to configure your stuff.
 */
SRocket.fromPort(5555)
	// Here we tell srocket to add the UserController
	.controllers(UserController)
	// and start the server.
	.listen(() => {
		console.log("Server started!");
	});

/*
 * If you want to try out this sample, you can use the default socket.io client.
 * If you DONT have a FRONTEND you can use this website: https://amritb.github.io/socketio-client-tool/
 *
 * Just connect to the server and start emitting :)
 *
 * Note that the URL to the server is: http://localhost:5555
 * And there is no namespace so you can directly emit with: "login" for example in the "Emiting" tab.
 */
