# Error Handling

Error Handling in srocket is kept very simple. If a route method of your app throws a error, the ```onError``` route method will be called

### Example {docsify-ignore}

```ts
@RouteConfig({
	route: '/param',
})
class DataRoute extends Route {

	onError(e: Error, req: Request, res: Response) {
		// There is a very usefull method on the response that can be uses to emit errors.
		// The res.error method - It automatically relays the request to the client that sent the Request.
		res.error(e);
		console.log('Internal Error caught in "/param" -> ', e.message);
	}

	on(req: Request<ModelRequest>, res: Response) {
		console.log('GOT CALL TO: /param -> with: ', req.data);
		throw new Error('Custom error that should be caught be the internal error handler');
	}
}

```

### Handling Validation Errors {docsify-ignore}

Currently there is no automatic handling of validation errors, but there is the plan to provide usefull methods for that.
Methods like ```res.validationError(e)``` on the response object. This then could be easily integrated into the ```onValidationError``` Route Method.
So you would not have to write it yourself over and over again. If you are interested in such a feature make a issue on GitHub and I will work on it faster.