# Router

The Router is the main selling point of SRocket. It can be used to make your application modular and easy to maintain.

## Step by Step example

##### Basics

First lets get a basic example of a Route down.

```ts

import Route from "src/router/route";
import { RouteConfig, NestedRoute } from 'src/decorator/Route';

class PlayerUpdateRoute extends Route {} 

```

This is the most basic route there is, it does no more than exist, but it will be used in this tutorial as a base.

##### The Route Decorator

Now the first step to make a route come alive is to add a RouteConfig decorator.

```ts

@RouteConfig({
	route: 'player-update'
})
class PlayerUpdateRoute extends Route {}

```

As you can see the decorator, is applied above the class, it will be used internally to route any incomming packets.
The decorator accepts a object with various properties, the property set in the above example is the ``` route ``` parameter, it must be set,
since the framework wouldnt know how to route a packet to this event otherwise. 

Note that there are no rules for how you should name you route, you decide whats best for your project.

> There are many more properties see all of them [here](https://github.com/FetzenRndy/SRocket/blob/master/lib/src/router/RouteConfig.ts)

##### Route Methods

There are several route methods, lets explore some of them.

- 'on' - Method is called whenever your app recieves a socket.io event with the same identifier.
	- In this example you would have to ``` socket.emit('player-update); ``` to call the on method.
	- This methods recieves a express.js like request and response object. ( See the docs [here](route-methods.md) )

	```ts
	on(req: Request, res: Response) {
		// Handle the event.
		req.data({
			userName: 'John Doe',
			otherProp: req.someProp
		}).relay();
	}
	```