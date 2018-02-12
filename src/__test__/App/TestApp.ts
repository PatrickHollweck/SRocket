process.env['DEBUG'] = 'srocket:*';

import SRocket from './../../SRocket';
import Route, { NestedRoute } from '../../router/Route';
import { RouteConfig } from '../../router/decorator/Route';

const srocket = new SRocket(1337);

@RouteConfig({
	route: 'users'
})
class UserController extends Route {

	addRoute = class extends NestedRoute {
		config = {
			route: '.add'
	 	};

		on() {
			console.log('Call to /users/add');
		}
	};

	deleteUser = class extends NestedRoute {
		config = {
			route: '.delete'
		};

		on() {
			console.log('Call to /users/delete');
		}
	}

	constructor() {
		super();

		// TODO: Maybe we can make this call redundant ?
		this.addNestedRoute(this.addRoute);
		this.addNestedRoute(this.deleteUser);
	}

	on(socket: SocketIOExt.Socket) {
		console.log('/users');
	}
}

srocket.router.register(UserController);

srocket.listen(() => {
  console.log(`Server is listening on ${1337}`);
});