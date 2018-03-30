# Middleware

SRocket has full support for middlewares, not everything is implemented yet - but we will get there.
Middlewares are usefull for all sorts of things, for exmaple for authentication.

### A sample middleware {docsify-ignore}

A middleware is like pretty much everything else in srocket, a class. In this case its a class that extends the ````MiddlewareBase``` class.
The ````MiddlewareBase``` is exported directly from the ```srocket``` package.

So lets get started and create a sample middleware.
- Step 1 - Create the Middleware.
```ts
import { MiddlewareBase } from "srocket";

export class AuthenticationMiddleware extends MiddlewareBase {
	beforeEventCall() {
		// Do auth logic.
	}
}
```
- Step 2 - Register the middleware.
```ts
const app = new SRocket(config);
app.use(new AuthenticationMiddleware());
```
- Step 3 - Profit ???
Now everytime a events get sent to srocket, the middleware will be called before the ```on``` handler from the Route will be called.


!> Middleware are no where near to be finished... Alot may change in the future! - There will be no further documentation other that the above until they are somewhere finished!

To find out what method you can override in your middleware check [this](https://github.com/FetzenRndy/SRocket/blob/master/lib/src/middleware/MiddlewareBase.ts) source document!