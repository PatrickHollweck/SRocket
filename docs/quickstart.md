# Quick Start {docsify-ignore}

> This 'Quick-Start' guide requires atleast a basic understanding of [nodejs](nodejs.org), [socket.io](socket.io) and [typescript](https://www.typescriptlang.org/)!

### Intro

Working with plain socket.io can be frustrating. There is so much work you got to do manually.
SRocket aims to solve that problem in a clean and simple fashion.

One of the more important things to understand is that SRocket is merly a wrapper around socket.io
"all" it does is wrap your routes with some usefull and safe utility.

### Setup

To get started install the SRocket [npm package](https://www.npmjs.com/package/srocket) via this command

`npm install srocket`

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

@SocketController(/* Optional Config */)
class ActionController extends Controller {
	$onConnect(socket: SocketIO.Socket) {
		console.log("A socket connected...", socket.id);
	}

	$onDisconnect(socket: SocketIO.Socket) {
		console.log("A socket disconnected...", socket.id);
	}

	@SocketRoute()
	greet(event: SEvent) {
		event.response
			.withData({
				message: "Hello, " + event.request.data.name
			})
			.invokeAck();
	}
}

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
