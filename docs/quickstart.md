
# Quick Start {docsify-ignore}

> This 'Quick-Start' guide requires atleast a basic understanding of [nodejs](nodejs.org), [socket.io](socket.io) and [typescript](https://www.typescriptlang.org/)!

### Setup

To get started install the SRocket [npm package](https://www.npmjs.com/package/srocket) via this command 

``` npm install srocket --save ```

### A basic Server

SRocket gets alot of its ideas from frameworks like express so starting a app is very simular to how you would do it in express.

> A note about imports: Everything you will want to use from srocket is exported directly from the 'srocket' packet!

```ts
// Import all the required pieces...
import { SRocket, ConfigBuilder } from 'srocket';

// Create config, via the ConfigBuilder, to configure the server.
const config = new ConfigBuilder()
			.setPort(8080)
			.build();

// Pass the config to a new SRocket object...
const app = new SRocket(config);

// Start listening, on the port set by the config...
app.listen(() => console.log(`SRocket server listening on port ${srocket.getConfig().port}`));
```

The example above will start the server at port 8080. To test SRocket applications without a frontend try [this](http://amritb.github.io/socketio-client-tool/) website.

### Using the Router

The above example is not very usefull on its own since it does not respond to any socket events. To change this, let us create some routes.
Routes are the main selling point of SRocket and allow you to make you app modular. They are class based javascript objects,
which you register in your app. Routes in SRocket are just like regular http routes, except that they are way more flexible.

#### Creating your first route.

A basic route looks like this:

```ts
import { RouteConfig, Route, Request, Response } from "srocket"

/* 
 * Use a typescript decorator to define some metadata about the route.
 * In this example you pass it a object with a required key, named path.
 * This path defined to which "route-path" the event should respond to.
 */
@RouteConfig({
	path: '/users'
})
class GetUsersRoute extends Route {
	/*
	 * Then below the decorator create a class, that extends the Route base-class from SRocket.
	 * The Method below named "on" will be called when srocket get a call from the frontend matching the above path.
	 */
	on(req: Request, res: Response) {
		console.log('Call to /users');
	}
}
```

In the above example we create a bare-bones example for a Route. A route is basically a class, that extends the ```Route``` base class 
and has a ```@RouteConfig``` decorator. The decorator defines Metadata about the Route. Every Route Decorator must have a ```path``` property.
The path property is one of many properties that are used internally be the framework. The required ```path``` property defines the route that
must be called by a client to activate the Route.

#### Registering Routes.

To register routes insert this function call before the listen call of the above snippet.
```ts
srocket.router.register(GetUsersRoute)
```

Alternativly if you want to register multiple Routes you can use the following function, to make the registration of routes more compact.
````ts
srocket.router.registerBulk(RouteA, RouteB, RouteC, RouteD);
```

### Clientside usage.

To emit events from a client, you can use any standart Socket.io client, or if you do not have a frontend yet, you can use [this](http://amritb.github.io/socketio-client-tool/) website. 

#### Running the App.

Before you connect to a SRocket app, the Server must be running of course. 
Since SRocket is just a node package you can use any standart node runner, but since you propably use typescript you need to precompile the source.
There are multiple ways to run a Typescript node app, choose one.

- ts-node - The ts-node npm package is used to run typescript in node.
	1. Install it via ``` npm install ts-node ```
	2. Run the main.ts file via ``` ts-node main.ts --watch ```

- Compiling and then running - The other and less confortable way is to compile the typescript source and then run the emitted js.
	1. Compile the source with: ``` tsc main.ts ```
	2. Run the compiled js: ``` node main.js ```
	
> Note: You may also want to use the npm-package 'nodemon' for automatic Server restarts.

#### Emitting from the client-side.

As a example we will emit a event to the example route from created above. 
After the SRocket server is running you can connect to it via the standart [socket.io](socket.io) client, in this example we will emit to example ``` Route ``` registered above.

```js
socket.emit('/users');
```

After the client emit you should see this output:
```Output
>>> Call to /users
```

### Where to go from here ?

You now should have a basic understanding of the framework, but there is still alot to learn. Check out the more specific docs at the ```Guide``` section on the navigator on the left side.