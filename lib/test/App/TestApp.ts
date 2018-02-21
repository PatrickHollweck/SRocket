process.env['DEBUG'] = 'srocket:*';

import { RouteConfig, NestedRoute } from 'src/decorator/Route';
import { ModelProp } from 'src/io/model/ModelProp';

import SRocketConfigBuilder from 'src/SRocketConfigBuilder';
import Response from 'src/io/Response';
import Request from 'src/io/Request';
import SRocket from 'src/SRocket';
import Route from 'src/router/Route';
import Model from 'src/io/model/Model';
import Rule from 'src/validation/decorator/Rule';

import * as v from 'class-validator';

// NOTE: Before I get to writing proper tests use this tool: http://amritb.github.io/socketio-client-tool/

const config = new SRocketConfigBuilder()
	.setPort(1337)
	.build();

const srocket = new SRocket(config);

class DeleteUserRequestModel extends Model {
	@ModelProp()
	@Rule('NotNull')
	@v.IsDefined({ message: 'The userName must be defined!' })
	@v.IsNotEmpty({ message: 'The userName must not be empty!' })
	@v.IsString({ message: 'The userName must be a string' })
	public userName: string;
}

@RouteConfig({
	route: '/users',
	data: {
		userID: { type: Number, rules: 'NotNull|Between:0:10' }
	}
})
class UserController extends Route {
	onValidationError(error: Error) {
		console.log('Validation error caught!', error.message);
	}

	on(req: Request, res: Response) {
		console.log('GOT CALL TO: /users/add -> with: ', req.data);
	}
}

srocket.router.register(UserController);

srocket.listen(() => {
	console.log(`Server is listening on ${srocket.getConfig().port}`);
});
