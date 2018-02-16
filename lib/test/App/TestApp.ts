import { TestEvent } from 'test/Helpers/TestEvent';
process.env['DEBUG'] = 'srocket:*';

import { RouteConfig, NestedRoute } from 'src/decorator/Route';

import Response from 'src/io/Response';
import Request from 'src/io/Request';
import SRocket from 'src/SRocket';
import Route from 'src/router/Route';
import SRocketConfigBuilder from 'src/SRocketConfigBuilder';

const config = new SRocketConfigBuilder()
					.setPort(1337)
					.build();

const srocket = new SRocket(config);

@RouteConfig({
	route: '/users'
})
class UserController extends Route {

	@NestedRoute({
		route: '/add',
		data: {
			user_name: { type: Number, rules: 'NotNull|Between:10:20' },
		}
	})
	addUser = class extends Route {
		onValidationError(error: Error) {
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
	console.log(`Server is listening on ${srocket.getConfig().port}`);
});
