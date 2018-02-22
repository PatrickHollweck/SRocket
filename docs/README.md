# SRocket
> SRocket ( short for: SocketRocket ) is a batteries-included opinionated socket.io framework written in typescript.

## Disclaimer

SRocket is still under heavy construction! When the framework is released there will be a npm-package, and maybe even a cli since SRocket is very opinionated.
While reading the documentation keep in mind that the structure and the api may change at every point in time. 
Currently the easiest way to get started using the framework is coping from source!

## Introduction
Have you ever worked with pure socket.io and wanted a bit more structure to your project ? If so SRocket is the answer to that,
It has all the features you need to build your next real-time application in a http inspired way. Features like the built-in router
make code orgainstation a breez and the support for typescript and model based validation make your application safe and easy to maintain. 

## Features

- Typesafe by nature.
- Full Typescript support.
- Classbased fluent routing.
- Builtin validation.
- Fully extensible with access to the lower level parts and middlewares.

## Getting Started

> This 'Getting-Started' guide requires atleast a basic understanding of socket.io and typescript!

#### Setup

The easiest way to get started is to install the SRocket [npm package](/) ( Unavailable while not released! ) or via this command ``` npm install srocket --save ```.
After installing the npm package create a ``` main.ts ``` file.

#### A basic Server

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

The example above will start the server at port 8080. To test SRocket application without forcing you to build a frontend try [this](http://amritb.github.io/socketio-client-tool/) website

#### Using the Router

The above example is not very usefull on its own since it does not respond to any socket events. To change this, let us create some routes.
Routes are the main selling point of SRocket and allow you to make you app modular. Routes are class based javascript objects,
which you register in your app. Routes in SRocket are just like regular http routes, except that they are way more flexible.

##### Creating your first route.

A Route might look like this:

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

You see that routes are class-based, so to add some utility functions you might want to use the route extends the ``` Route ``` base class.
Also there is a decorator, which configures the Route!

##### Registering Routes.

To register routes insert this function call before the listen call of the above snippet.

´´´ts
srocket.router.register(Route)
´´´
