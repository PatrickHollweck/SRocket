process.env['DEBUG'] = 'srocket:*';

import Route from '../../router/Route';
import SRocket from './../../SRocket';
import Request from '../../interaction/Request';
import Response from '../../interaction/Response';

import { RouteConfig, NestedRoute } from '../../router/decorator/Route';

const srocket = new SRocket(1337);

@RouteConfig({
	route: '/users'
})
class UserController extends Route {

	@NestedRoute({
		route: '/add'
	})
	addUser = class extends Route {
		on() {
			console.log('GOT CALL TO: /users/add');
		}
	};

	@NestedRoute({
		route: '/delete'
	})
	deleteUser = class extends Route {
		on(req:Request, res:Response<{ user_name:string }>) {
			console.log('GOT CALL TO: /users/delete');

			res.status(404)
			    .message('Room suckaz:)')
				.toAllInRoom('helloWorld');
		}
	};

	on(req, res) {
		console.log('GOT CALL TO: /users');
	}
}

srocket.router.register(UserController);

srocket.listen(() => {
	console.log(`Server is listening on ${1337}`);
});