process.env['DEBUG'] = 'srocket:*';
require('tsconfig-paths/register');

import { SRocket, Model, Route, Request, Response } from 'src/SRocket';
import { RouteConfig, NestedRoute, ModelProp } from 'src/decorator';
import { SRocketConfigBuilder } from 'src/config';
import { BaseMiddleware } from 'src/middleware';
import { tsV, jsV } from 'src/validation';

// NOTE: Before I get to writing proper tests use this tool: http://amritb.github.io/socketio-client-tool/

const config = new SRocketConfigBuilder()
	.setPort(1340)
	.build();

const srocket = new SRocket(config);

class ModelRequest extends Model {
	@ModelProp()
	@tsV.IsDefined({ message: 'The userName must be defined!' })
	@tsV.IsNotEmpty({ message: 'The userName must not be empty!' })
	@tsV.IsString({ message: 'The userName must be a string' })
	public userName: string;
}

@RouteConfig({
	route: '/model',
	model: ModelRequest
})
class ModelRoute extends Route {
	onValidationError(error: Error) {
		console.log('"/model -> Validation error caught!', error.message);
	}

	on(req: Request<ModelRequest>, res: Response) {
		console.log('GOT CALL TO: /model -> with: ', req.data);
	}
}

@RouteConfig({
	route: '/param',
	data: {
		userName: {
			type: String, rules: [{
				rule: jsV.contains,
				args: ['patrick'],
				message: 'The $property did not contain "$arg1"'
			}]
		}
	}
})
class DataRoute extends Route {

	onError(e: Error, req: Request, res: Response) {
		console.log('Internal Error caught in "/param" -> ', e.message);
	}

	onValidationError(error: Error) {
		console.log('"/param" -> Validation error caught!', error.message);
		// throw new Error('Custom error that should be caught be the internal error handler');
	}

	on(req: Request<ModelRequest>, res: Response) {
		console.log('GOT CALL TO: /param -> with: ', req.data);
	}
}

class SampleMiddleware extends BaseMiddleware {
	beforeEventCall() {
		console.log('BEFORE EVENT - Called by "SampleMiddleware"');
	}
}

srocket.router.registerBulk(
	ModelRoute,
	DataRoute
);

srocket.use(new SampleMiddleware());

srocket.listen(() => {
	console.log(`Server is listening on ${srocket.getConfig().port}`);
});
