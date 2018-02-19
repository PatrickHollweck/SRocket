process.env['DEBUG'] = 'srocket:*';

import { RouteConfig, NestedRoute } from 'src/decorator/Route';

import SRocketConfigBuilder from 'src/SRocketConfigBuilder';
import ModelBase from 'src/io/Model';
import Response from 'src/io/Response';
import Request from 'src/io/Request';
import SRocket from 'src/SRocket';
import Route from 'src/router/Route';
import Model from 'src/io/decorator/Model';

import * as v from 'class-validator';

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
			user_id: { type: Number, rules: 'NotNull|Between:10:20' },
		}
	})
	addUser = class extends Route {
		onValidationError(error: Error) {
			console.log('Validation error caught!', error.message);
		}

		on(req: Request, res: Response) {
			console.log('GOT CALL TO: /users/add -> with: ', req.data);
		}
	};

	@NestedRoute({
		route: '/delete',
	})
	deleteUser = class extends Route {

		onValidationError(e, req, res) {
			console.log(e.message);
		}

		on(req: Request<{ id: number }>, res: Response<{ message: true }>) {
			console.log('GOT CALL TO: /users/delete -> with: ', req.data);
		}
	};

	on(req, res) {
		console.log('GOT CALL TO: /users -> with: ', req.data);
	}
}

srocket.router.register(UserController);

srocket.listen(() => {
	console.log(`Server is listening on ${srocket.getConfig().port}`);
});
