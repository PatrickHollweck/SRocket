# Error Handling

Error Handling in srocket is kept very simple. If a route method of your app throws a error, the ```onError``` route method will be called

### Example {docsify-ignore}

```ts
@RouteConfig({
	route: '/param',
})
class DataRoute extends Route {

	onError(e: Error, req: Request, res: Response) {
		console.log('Internal Error caught in "/param" -> ', e.message);
	}

	on(req: Request<ModelRequest>, res: Response) {
		console.log('GOT CALL TO: /param -> with: ', req.data);
		throw new Error('Custom error that should be caught be the internal error handler');
	}
}

```