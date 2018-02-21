process.env['DEBUG'] = 'srocket:*';

import { RouteConfig, NestedRoute } from 'src/decorator/Route';
import { ModelProp } from 'src/io/model/ModelProp';

import SRocketConfigBuilder from 'src/SRocketConfigBuilder';
import Response from 'src/io/Response';
import Request from 'src/io/Request';
import SRocket from 'src/SRocket';
import Route from 'src/router/Route';
import Model from 'src/io/model/Model';

import * as v from 'class-validator';

const config = new SRocketConfigBuilder()
	.setPort(1337)
	.build();

const srocket = new SRocket(config);

class DeleteUserRequestModel extends Model {
	@ModelProp()
	@v.IsDefined({ message: 'The userName must be defined!' })
	@v.IsNotEmpty({ message: 'The userName must not be empty!' })
	@v.IsString({ message: 'The userName must be a string' })
	public userName: string;
}

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
		model: DeleteUserRequestModel,
	})
	deleteUser = class extends Route {
		onValidationError(e, req, res) {
			console.log(e.message);
		}

		on(req: Request<DeleteUserRequestModel>, res: Response<{ userID: number }>) {
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
