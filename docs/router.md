# The Router

SRocket uses a custom router to avoid the pains of socket.io
Here is a indept guide to it.

## Namespaces

SRocket fully supports namespaces.
You can define that a controller should be namespaced, via the `SocketController` decorator.

Sample:

```ts
@SocketController({
	namespace: "users"
})
class UserController extends Controller { ... }
```

When you register the Controller, SRocket will look for this decorator and find, that you
have defined the namespace property, which will cause it to namespace it.

To "namespace" the controller, SRocket will use pure socket.io namespaces
You can connect to this endpoint like this

```ts
const socket = io.connect("https://localhost:3000/users");
```

## Paths

You can let SRocket prefix every path by adding the `prefix` key to the `SocketController` decorator
This will prefix every route with the specified string.

The prefix and the acutal route name will be seperated by a seperator, this seperator can be configured
by using `SRocket.setSeperationConvertion(<string>)`

By default the convention is `":"`

```ts
@SocketController({
	prefix: "unsafe"
})
class UserController extends Controller { ... }
```

Client:

```ts
socket.emit("unsafe:login");
```

## Connect and Disconnect

SRocket lets you define special "meta" routes, these routes, are namely the socket.io event
equivalent to "connect" and "disconnect", They are prefixed with a "\$".

You can use them in controllers like this

```ts
@SocketController()
class UserController extends Controller {
	$onConnect(socket: SocketIO.Socket) {
		console.log("A socket connected...", socket.id);
	}

	$onDisconnect(socket: SocketIO.Socket) {
		console.log("A socket disconnected...", socket.id);
	}
}
```

## Overriding the function Paths

By default every route has the path of the function name which defines it
Like in the example

```ts
@SocketController()
class UserController extends Controller {
	@SocketRoute()
	login(event: SEvent) {
		// ...
	}
}
```

You can invoke this route with: `socket.emit("login")`
You can override the path like this:

```ts
@SocketController()
class UserController extends Controller {
	@SocketRoute({
		path: "userLogin"
	})
	login(event: SEvent) {
		// ...
	}
}
```

You can invoke this route with: `socket.emit("userLogin")`
