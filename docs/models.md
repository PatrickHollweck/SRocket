# Models


!> Due to the way models are implemented in SRocket, you can not use the typescript 'strictPropertyInitialization' rule!

## What is a Model?

A model is simply a class that extends the ```Model``` base class. 
All Properties of a Model should have the ```@ModelProp``` decorator. Decorated properties will be used as a data template when used
in conjunction with other SRocket parts, like the Route. For example the SRocket Router will automatically
validate a given model when configured to. Validation with models and the 'class-validator' is covered [here](model-validation.md)

## How to define a Model?

Here is a example on how a Model may look like.

```ts
import { Model, tsV } from "srocket"

class User extends Model {
    // Template property.
    @ModelProp()
    @tsV.isDefined({ message: 'The users name must be defined!' })
    @tsV.isString({ message: 'The users name must be typeof string!' })
    public name: string;

    // Custom method
    public isAdmin() : boolean {
        return this.name === 'Patrick'
    }
}
```