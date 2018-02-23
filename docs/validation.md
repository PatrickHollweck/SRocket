# Validation

### Preface

Since WebSockets are networks, everything transmitted by them becomes type-un-safe, so to counteract this
SRocket provides you with two methods to validate and type your data.

### Validation Methods

There are two main ways to validate data in SRocket. The one is model based so in prinziple you have a model
for every event, which contains the data, and some optional but powerfull validation decorators. The other
allows you to define some type and validation metadata in the ``` @RouteConfig ``` decorator.

SRocket makes validation easy, you just have to give it the general layout of the data, and when it recieves
the data, it will automatically validate the data, and then eighter call the 'on' method with the validated data, when the validation succeded, or the 'onValidationError' method when the validation failed.

> Author note: In my opinion you should use model based validation, the trade-off is typesafety for verbosity

1. Model based validation - [example](/validation?id=model-based-validation) - [DOCS](/model-validation)
	- Advantages
		- Easy reuse with frontend
		- Properties are class members and are easier to deal with.
		- More declarative and typesafe validation via [validation decorators](https://www.npmjs.com/package/validator.ts)
	- Disadvantages
		- More verbose, requires extra classes.

2. Parameter based validation - [example](/validation?id=parameter-based-validation) - [DOCS](/parameter-validation)
	- Advantages
		- Easy to configure without the need for extra classes.
		- Compact usage within the ``` @RouteConfig ``` decorator.
	- Disadvantages
		- Uses a custom validation system written from the SRocket authors which may not be as full-featured.
		- Can not be reused with the frontend,
		- Can not use any model class based advantages.

### Examples

#### Model based validation. - [DOCS](/model-validation)

```ts
import * as v from 'class-validatior';

class AddUserRequestModel extends Model {
	@v.isString({ message: 'The userID must be a string' })
	@v.isDefined({ message: 'The userID must be defined' })
	public userID: string;
}

@RouteConfig({
	route: '/addUser',
	model: AddUserRequestModel
})
class AddUserRoute extends Route {
	onValidationError(e:Error, req:Request, res:Response) {
		// Handle Error
	}

	on(req: Request<AddUserRequestModel>, res:Response) {
		// Handle event.
	}
}

```

#### Parameter based validation. - [DOCS](/parameter-validation)

```ts
@RouteConfig({
	route: '/addUser',
	data: {
		userID: { type: String, rules: 'NotNull|MinLenght:5' }
	}
	class AddUserRoute extends Route {
		onValidationError(e:Error, req:Request, res:Response) {
			// Handle Error
		}
		
		on(req: Request, res: Response) {
			// Handle event.
		}
	}
})
```