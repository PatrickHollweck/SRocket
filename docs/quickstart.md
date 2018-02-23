
# Quick Start {docsify-ignore}

> This 'Quick-Start' guide requires atleast a basic understanding of [nodejs](nodejs.org), [socket.io](socket.io) and [typescript](https://www.typescriptlang.org/)!

### Setup

The easiest way to get started is to install the SRocket [npm package](/) ( Unavailable while not released! ) or via this command ``` npm install srocket typescript --save ```.
After installing the npm package create a ``` main.ts ``` file.

### A basic Server

SRocket gets alot of its ideas from frameworks like express so starting a app is very simular to how you would do it in express.

```ts
import SRocket from 'src/SRocket';
import SRocketConfigBuilder from 'src/SRocketConfigBuilder'

const config = new SRocketConfigBuilder()
			.setPort(8080)
			.build();

const app = new SRocket(config);

app.listen(() => console.log(`SRocket server listening on port ${srocket.getConfig().port}`));
```

The example above will start the server at port 8080. To test SRocket applications without a frontend try [this](http://amritb.github.io/socketio-client-tool/) website

### Using the Router

The above example is not very usefull on its own since it does not respond to any socket events. To change this, let us create some routes.
Routes are the main selling point of SRocket and allow you to make you app modular. They are class based javascript objects,
which you register in your app. Routes in SRocket are just like regular http routes, except that they are way more flexible.

#### Creating your first route.

A basic route looks like this:

```ts
@RouteConfig({
	route: '/users'
})
class GetUsersRoute extends Route {
	on(req: Request, res: Response) {
		console.log('Call to /users');
	}
}
```

You see that routes are class-based, so to add some utility functions you might want to extend the ``` Route ``` base class.
Also there is a decorator, which configures the Route, in this Example only the ``` route  ``` property is set, but there are
many more options especially for validation but we will explore these later.

#### Registering Routes.

To register routes insert this function call before the listen call of the above snippet.

```ts
srocket.router.register(Route)
```

### Clientside usage.

To emit events from the clientside, you can use the standart Socket.io client which is availiable on npm, or if you do not have a frontend yet, you can use [this](http://amritb.github.io/socketio-client-tool/) website. 
As a example we will emit a event to the example route from created above. 

#### Running the App.

To connect to the SRocket App the Server must be running of course.
There are multiple ways to run a SRocket Server, choose one.

- ts-node - The ts-node npm package is used to run typescript in node.
	1. Install it via ``` npm install ts-node ```
	2. Run the main.ts file via ``` ts-node main.ts --watch ```

- Compiling and then running - The other and less confortable way is to compile the typescript source and then run the emitted js.
	1. Compile the source with: ``` tsc main.ts ```
	2. Run the compiled js: ``` node main.js ```
	
> Note: You may also want to use the npm-package 'nodemon' for automatic Server restarts.

#### Emitting from the client-side.

After the SRocket server is running you can connect to it via the standart [socket.io](socket.io) client, in this example we will emit to example ``` Route ``` registered above.

```js
socket.emit('/users');
```

After the client emit you should see this output:
```Output
>>> Call to /users
```