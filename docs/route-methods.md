# Route Methods

By route methods, callback like methods on a ```Route``` are meant,
you can override them, since there is a empty definition in the Route base class but you dont have to.
These methods will then be called by the framework on specific events.

> The request and response parameters are generic and can take the type of the model, of the response / request.

- 'on' - Method is called whenever your app recieves a socket.io event with the same identifier.
	- Recieves a express.js like request and response object. ( See the docs [here](request.md) )
	```ts
	on(req: Request<ModelType>, res: Response<ResponseType>) {
		// Handle the event.
		req.data({
			userName: 'John Doe',
			otherProp: req.someProp
		}).relay();
	}
	```

- 'onValidationError' - Method called by the framework when the validation failed.
	- Recieves the Error, the Request and the Response. 

	```ts
	onValidationError(e: Error, req: Request, res: Response) {
		// Handle the Error.
	}
	```
- 'onError' - Called when an js error occours in other route methods.
- 'before' - Called before 'on'
- 'after' - Called after 'on'

### Async Route Methods.

**All** Route methods can be async. So you can use stuff like redis without problems in your routes.
To define a asnyc Route Method you just put the ```async``` key word before the method, or make it return a promise.

#### Example
> Example for a async 'on' Route Method.

```ts
async on(req: Request, res: Response) {
	const connection = await createRedisConnection();
	const someValueFromRedis = await connnection.get("key");

	res.withData({
		userName: someValueFromRedis,
	}).relay();
}
```

### Stock Events.

You may have noticed that we havent covered how to listen to some stock socket.io event like ```connection```.
This has a reason, with srocket you should build your applications less 'statefull' - this should not mean that you should have no state -
But you should store state in the Route or in a store like Redis and then get the data you need from these Stores, so there is no real need for a connection event...

Nontheless, sometimes you need support for one, so there is. You register stock socket.io handlers like - connection, disconnect... - like this.

```ts
const app = new SRocket(config);
app.ioServer.on('connection', socket => {
	console.log("I handle the 'connection' event...");
});
```