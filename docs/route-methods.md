# Route Methods

There are several route methods, lets explore some of them.
By route methods, callback like methods are meant, you can override them, since there is a empty definition in the Route base class. These methods will then be called by the framework on specific events.

- 'on' - Method is called whenever your app recieves a socket.io event with the same identifier.
	- In this example you would have to ``` socket.emit('player-update); ``` to call the on method.
	- Recieves a express.js like request and response object. ( See the docs [here](request.md) )

	```ts
	on(req: Request, res: Response) {
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
- 'before' - Called before 'on'
- 'after' - Called after 'on'