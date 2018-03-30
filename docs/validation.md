# Validation

### Preface

Every piece of data you get from the client, has to be transmitted by a network, this means that your data is untyped.
In a attempt to make your app more robust SRocket provides you with 2 Methods of validating your data.

> Validation is completly optional.

### Validation Methods

SRocket makes validation easy, you define models ( data-classes ) for you data, and hand them to SRocket.
Then evertime SRocket gets a message from the Client it, validates the data using the model, and if validation fails, it calls the ```onValidationError```
Method on your route. Otherwise if validation succeeds, it calls the ```on``` Method on your Route with the validated data.

1. Model based validation - [example](/validation?id=model-based-validation) - [Documentation page](/model-validation)
	- Advantages
		- Easy reuse with frontend
		- Properties are class members and are easier to deal with.
		- More declarative and typesafe validation via [validation decorators](https://www.npmjs.com/package/validator.ts)
		- Allows you to defined extra method in the class, to encapsulate logic.
	- Disadvantages
		- More verbose, requires extra classes.

2. Parameter based validation - [example](/validation?id=parameter-based-validation) - [Documentation page](/parameter-validation)
	- Advantages
		- Easy to configure without the need for extra classes.
		- Compact usage within the ``` @RouteConfig ``` decorator.
	- Disadvantages
		- Can not be reused with the frontend,
		- Can not use any model class based advantages like class methods.


### What is the ```jsV``` and ```tsV``` ?

```tsV``` and ```jsV``` is short for typescript || javascript Validator. Both of these Validators are popular Validation libraries, so you may already
be familuar with them. You use these special instances from the framework so you dont have to take care about the configuration and managment.
You import both of these directly from srocket ```import { jsV, tsV } from "srocket"```.
Every technique - explained above - uses one library. The Model-Based-Validation uses the ```tsV```, and the Parameter-Based-Validation uses the ```jsV```.

### Examples

#### Model based validation. - [Documentation page](/model-validation)

!> This validation technique uses the [class-validator](https://github.com/typestack/class-validator) library.

```ts
import { tsV, Request, Response, Route, RouteConfig, Model, ModelProp } from 'srocket';

class AddUserRequestModel extends Model {
	@ModelProp()
	@tsV.isString({ message: 'The userID must be a string' })
	@tsV.isDefined({ message: 'The userID must be defined' })
	public userID: string;
}

@RouteConfig({
	route: '.addUser',
	model: AddUserRequestModel
})
class AddUserRoute extends Route {
	onValidationError(e:Error, req:Request<AddUserRequestModel>, res:Response) {
		// Handle Error
	}

	on(req: Request<AddUserRequestModel>, res:Response) {
		// Handle event.
	}
}

```

#### Parameter based validation. - [Documentation page](/parameter-validation)

!> This validation technique uses the [javascript-validator](https://github.com/chriso/validator.js) library

```ts

// Even thought this might seem verbose, most of the properties in the data object are optional.

import { jsV, Request, Response, Route, RouteConfig } from 'srocket';

@RouteConfig({
	route: '/param',
	data: {
		userName: {
			type: String, 
			rules: [{
				rule: jsV.contains,
				args: ['patrick'],
				message: 'The $property did not contain "Patrick"'
			}]
		}
	}
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