process.env['DEBUG'] = 'srocket:*';

import Route from '../../router/Route';
import SRocket from './../../SRocket';
import Request from '../../interaction/Request';
import Response from '../../interaction/Response';

import { RouteConfig, NestedRoute } from '../../router/decorator/Route';
import ValidationError from '../../Exceptions/ValidationError';

const srocket = new SRocket(4250);

@RouteConfig({
	route: '/users'
})
class UserController extends Route {

	@NestedRoute({
		route: '/add',
		data: {
			user_name: String,
		}
	})
	addUser = class extends Route {
		onValidationError(error: ValidationError) {
			console.log('Validation error caught!', error.message);
		}

		on(data) {
			console.log('GOT CALL TO: /users/add -> with: ', data);
		}
	};

	@NestedRoute({
		route: '/delete',
	})
	deleteUser = class extends Route {
		on(data, req: Request, res: Response<{ user_name: string }>) {
			console.log('GOT CALL TO: /users/delete -> with: ', data);
		}
	};

	on(data, req, res) {
		console.log('GOT CALL TO: /users -> with: ', data);
	}
}

srocket.router.register(UserController);

srocket.listen(() => {
	console.log(`Server is listening on ${4250}`);
});
