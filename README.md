# SRocket
- SRocket - SocketRocket - is a opinionated typesafe socket.io framework.

### Intro
Have you ever worked with socket.io and felt insecure because of the unsafe structure websockets have ?
No? I atleast did, and since I have way to much time, i created another javascript framework ( like thats something anyone would want).

### Features
- Typesafe by nature.
- Full Typescript support.
- Classbased fluent routing.
- Builtin validation.
- Fully extensible with access to the lower level parts and middlewares.

> More will soon be implemented, SRocket is still in heavy development and not at all production-ready. When I think it has all the needed features and is ready to be released there will be a npm package.

### A sneek peek into the code.
Examples may be out of date!

##### The main 'entry-point' of a SRocket app.
```ts
// Enables the inbuilt debug-logging.
process.env['DEBUG'] = 'srocket:*';

import SRocket from 'src/SRocket';

// Create a new instance of the SRocket object.
const srocket = new SRocket({ port: 1250 });

// Register a Route - Example below.
srocket.router.register(UserController);

// Start listening and execute a optional callback.
srocket.listen(() => {
	console.log(`Server is listening on ${4250}`);
});

```

##### A Route 'Controller'
```ts
import { RouteConfig, NestedRoute } from 'src/decorator/Route';
import Response from 'src/io/Response';
import Request from 'src/io/Request';
import Route from 'src/router/Route';

// Creates a Route
@RouteConfig({
	route: '/users'
})
export class UserController extends Route {

    /* 
     * Every Route has a 'on' method called when the event is received from the client.
     * There is also a optional 'onValidationError' method triggered when there is a validation error, duh.
     * In this case tho we havent specified any data in the @RouteConfig decorator ( examples with data below! )
     * This method would respond to '/users'
     */
	on(data, req:Request, res:Response<any>) {
		res.toAllInNamespace('/');
	}

    /*
     * Optional Nested Routes ( would respond to : '/users/register' )
     * This is a route that accepts data, the data is specified in the data region of the NestedRoute decorator
     * Notice that data can be validated, first of all by the type, and by the built in validator.
     * The built in validator works alot like the 'laravel' validator and is 'Rule' based. You can create
     * your own rules. Examples will be added later tho :)
     */
	@NestedRoute({
		route: '/register',
		data: {
			userName: { type: String, rules: 'NotNull|MinLenght:5' }
		}
	})
	registerRoute = class extends Route {

        /*
         * Notice the above expression. There are so-called class-expressions. and are a feature of typescript
         * These class-expressions are used to create nested Routes! A nested Route has like every other Route
         * a couple of methods:
         * - 'before' -> Called before the 'on' method
         * - 'on' -> Called when a event with this route-name is called from the client-side.
         * - 'after' -> Called after the 'on' method.
         * - onValidationError -> Called when there is a validation Error.
         * Since these class expessions are properties of a parent class you can nested them infinetly...
         */

        /*
         * This is a mentioned validationError method. It receives a ValidationError, a request and a response.
         * In this method you can handle the error.
         */
		onValidationError(e:Error, req:Request, res:Response<any>) {
			res.status(400).message(e.message).toAllInNamespace();
		}

        /*
         * Let's go into more detail onto the 'on' method shall we ?
         * This method receives the data ( which can be a model of yours ) ( in the req object )
         * A Request - Which is a express inspired socket wrapper ( with access to the underlying socket )
         * A Response - Which is also a express inspired wrapper around the socket with many usefull methods.
         */
		on(req:Request<User>, res:Response) {
			res.status(202).data({
				userID: 21,
				...req.data
			}).relay();
		}
	};
}
```
