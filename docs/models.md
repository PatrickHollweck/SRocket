# Models

Models in SRocket are used as a data template from the framework. You may extend them to whatever you need them for thought.

!> Due to the way models are implemented in SRocket, you can not use the typescript 'strictPropertyInitialization' rule!

## What is a Model?

A model is simply a class that extends the model base class. It may have properties that
have the ``` @ModelProp ``` decorator. Decorated properties will be used as a data template when used
in conjunction with other SRocket parts, like the Route. For example the SRocket Router will automatically
validate a given model when configured to. Validation with models and the 'class-validator' is covered [here](model-validation.md)

## How to define a Model?

Here is a example on how a Model may look like.

```ts
import * as v from 'class-validator';

class User extends Model {
    // Template property.
    @ModelProp()
    @v.isDefined({ message: 'The users name must be defined!' })
    @v.isString({ message: 'The users name must be typeof string!' })
    public name: string;

    // Custom method
    public isAdmin() : boolean {
        return this.name === 'Patrick'
    }
}
```