process.env['DEBUG'] = 'srocket:*';

import SRocket from './../../SRocket';
import Route from '../../router/Route';
import { RouteConfig, NestedRoute } from '../../router/decorator/Route';

const srocket = new SRocket(1337);

@RouteConfig({
	route: 'users'
})
class UserController extends Route {

	@NestedRoute({
		route: '.add'
	})
	addUser = class extends Route {
		on() {
			console.log('Call to /users/add');
		}
	};

	@NestedRoute({
		route: '.delete'
	})
	deleteUser = class extends Route {
		on() {
			console.log('Call to /users/delete');
		}
	};

	on(socket: SocketIOExt.Socket) {
		console.log('/users');
	}
}

srocket.router.register(UserController);

srocket.listen(() => {
  console.log(`Server is listening on ${1337}`);
});