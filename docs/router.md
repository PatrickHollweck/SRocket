# Router

The Router is the main selling point of SRocket. It can be used to make your application modular and easy to maintain.

## Step by Step example

##### Basics

First lets get a basic example of a Route down.

```ts
import { Route, RouteConfig } from 'srocket';

class PlayerUpdateRoute extends Route {} 
```

This is the most basic route there is, it does no more than exist, but it will be used in this tutorial as a base.

#### The Route Decorator

Now the first step to make a route come alive is to add a RouteConfig decorator.

```ts
@RouteConfig({
	path: 'player-update'
})
class PlayerUpdateRoute extends Route {}
```

As you can see the decorator, is applied above the class, it will be used internally to route any incomming packets.
The decorator accepts a object with various properties, the property set in the above example is the ``` path ``` parameter, it must be set,
since the framework wouldnt know how to route a packet to this event otherwise. 

Note that there are no rules for how you should name you route, you decide whats best for your project.

> There are many more properties see all of them [here](https://github.com/FetzenRndy/SRocket/blob/master/lib/src/router/RouteConfig.ts)

#### Route Methods

Route methods are, callback like functions called by the framework on your route, when specific events happen.

To follow this guide you only need to know of the two main route-methods, 'on' and 'onValidationError'

- 'on' - Called by the framework, when a socket.io client calls the route.
- 'onValidationError' - Called by the framework when a validation error occures.

> For a detailed overview visit [this](route-methods.md) documentation page.

#### Completing the Route.

Now you should have a basic overview of how routes work, there is still more, find it under the 'Router' section in the sidebar.

To finish up this guide, lets see how a complete route with validation looks like.

```ts
import { tsV, Route, RouteConfig, Request, Response, ModelProp } from "srocket";

class SomeRouteRequestModel {
	@ModelProp()
	@tsV.isDefined({ message: 'The userName must be defined!' })
	@tsV.isString({ message: 'The userName must be typeof string!' })
	public userName: string;
}

@RouteConfig({
	path: 'some-event',
	model: SomeRouteRequestModel
})
class SomeRoute extends Route {
	onValidationError(e: Error, req: Request) {
		req.status(500).message(e.message).relay();
	}

	on(req: Request<SomeRouteRequestModel>, res: Reponse) {
		req.status(201).data({
			score: req.data.score + 1
		}).toAllInNamespacde();
	}
}

// In your app class.

srocket.route.register(SomeRoute);

```
