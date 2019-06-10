# Quick Start {docsify-ignore}

> This 'Quick-Start' guide requires you to have atleast a basic understanding of
> [nodejs](nodejs.org), [socket.io](socket.io) and [typescript](https://www.typescriptlang.org/)!

### Intro

Working with plain socket.io can be frustrating. There is so much work you got to do manually.
SRocket aims to solve that problem in a clean and simple fashion.

One of the more important things to understand is that SRocket is merly a wrapper around socket.io
"all" it does is wrap your routes with some usefull and safe utility.

### Setup

To get started install the SRocket [npm package](https://www.npmjs.com/package/srocket) via this command

`$ npm install srocket`

Next create a `.tsconfig` file atleast including this content

```json
{
	"compilerOptions": {
		"target": "es2015",
		"module": "commonjs",
		"experimentalDecorators": true,
		"emitDecoratorMetadata": true
	},
	"exclude": ["node_modules"]
}
```

!> It is important that the target is set to atleast `es2015`. If you do not meet this requirement you will face
errors.

### A basic Server

A minimal SRocket server could look like this:

```ts
import { SRocket, Controller, SocketController, SocketRoute } from "srocket";

/**
 * Declaration for a controller, A controller is more or less
 * just a container for routes.
 *
 * Every controller must inherit from `Controller` and must have a `SocketController`
 * decorator.
 *
 * You can use the decorator to define some metadata about the controller
 * such as:
 * - Namespace,
 * - Middleware that should be applies to all routes
 * - Prefix'es
 * - Additional metadata for plugins / addons
 */
@SocketController(/* Optional Config */)
class ActionController extends Controller {
	/**
	 * By inheriting from the controller class you get access
	 * to those two "special" routes.
	 *
	 * The will - like the name suggest - be called when
	 * a user connects or disconnects.
	 */

	$onConnect(socket: SocketIO.Socket) {
		console.log("A socket connected...", socket.id);
	}

	$onDisconnect(socket: SocketIO.Socket) {
		console.log("A socket disconnected...", socket.id);
	}

	/**
	 * Here we get to the core of SRocket.
	 * A Route, Just like with controllers, for a route
	 * to be registered it must be decorated with a
	 * `SocketRoute` decorator. Again, you use this
	 * to define metadata about the route, such as path
	 * or the middleware's to apply
	 *
	 * If you do not change the path to the route in the
	 * decorator, SRocket will use the function name as the path.
	 *
	 * Every route takes a `SEvent` object. This object is
	 * a wrapper for the request and response type, and saves you
	 * some typing.
	 *
	 * The `event.request` and `event.response` properties are
	 * somewhat simular to the express.js request and response objects.
	 */

	@SocketRoute()
	greet(event: SEvent) {
		/**
		 * Use the requests' validate method to validate the payload.
		 * This will throw when validation fails. But dont worry, SRocket
		 * will automatically catch validation errors for you.
		 * --------------
		 * SRocket uses a cool library named io-ts under the hood.
		 * This has some cool benefits. The schema you define below is 100%
		 * type safe.
		 *
		 * In the method you currently define a object with one key - "name"
		 * which is a string.
		 *
		 * SRocket can use this data to do runtime validation, and give back a
		 * `{ name: string }` back.
		 *
		 * You can have a look at io-ts here: https://github.com/gcanti/io-ts
		 * It allows you to do much more, like custom validated types, but have
		 * a look yourself.
		 */
		const data = event.request.validate(
			event.v.type({
				name: event.v.string
			})
		);

		/**
		 * Next, we access the response here,
		 * The Response is used... to well.. Respond to the client.
		 *
		 * It has a fluent builder which allows you to define what you want to do
		 * This example right here, adds the data specified in the object to the payload
		 * and then responds to the client by invoking the ack funciton of socket.io
		 */
		event.response
			.withData({
				message: "Hello, " + data.name
			})
			.acknowledge();
	}
}

/**
 * SRocket uses another builder for the "startup"
 * Here you can configure the SRocket server.
 *
 * Very self-explainatory so i will just leave this here.
 */
SRocket.fromPort(8080)
	.controllers(ActionController)
	.listen(() => console.log("SRocket server listening at port: 8080"));
```

This example starts a socket.io server listening at `http://localhost:8080`.
You can connect to it with a regular socket.io client, In this example we also define
a "route" named "greet" that greets the user.

> You can use [this](https://amritb.github.io/socketio-client-tool/) website to test the server.
> All you need to do is start the server with `ts-node ./server.ts` and srocket will do the rest.

You can emit a event named `greet` with data and will see that the data will be echo'ed back.

In "regular" socket.io-client code it would look like this:

```ts
const socket = io.connect("http://localhost:8080");

socket.emit("greet", { name: "Patrick" }, console.log);
// >> { message: "Hello, Patrick" }
```
