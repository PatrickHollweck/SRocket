# Nested Routes

Nested Routes in SRocket allow you to give your routes meaning by embedding them in parent objects.

## What is a nested Route?

A nested route is a route that is nested into another, the path to the route is added to the parents path.
This can be usefull when building large apps, it can give your app more structure and allows you to group
Routes.

## Creating nested Routes.

Since all routes are classes, you can create nested classes by embedding a class in a class, but there is a gotcha here.
Typescript does not support nested classes. To work around this limitations, you can create properties with anonymouse classes assigned to them.
But other than that nested routes are feature complete, meaning that they can do everything "normal" routes can.

The only thing that is then diffrent to "Normal" routes is that nested routes, use the ``` NestedRoute ``` decorator.

```ts
@RouteConfig({
    route: '/users'
})
class UserController extends Route {
    on(req: Request, res: Response) {
        // Handles calls to '/users'
    }

    @NestedRoute({
        route: '/add'
    })
    addUserRoute = class extends Route {
        on(req: Request, res: Response) {
            // Handles calls to '/users/add'
        }
    }
}
```