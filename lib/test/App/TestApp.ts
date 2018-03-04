process.env['DEBUG'] = 'srocket:*';

import * as v from 'class-validator';
import * as jv from 'validator';

import { RouteConfig, NestedRoute } from 'src/decorator/Route';
import { ModelProp } from 'src/io/model/ModelProp';

import SRocketConfigBuilder from 'src/SRocketConfigBuilder';
import Response from 'src/io/Response';
import Request from 'src/io/Request';
import SRocket from 'src/SRocket';
import Route from 'src/router/Route';
import Model from 'src/io/model/Model';

// NOTE: Before I get to writing proper tests use this tool: http://amritb.github.io/socketio-client-tool/

const config = new SRocketConfigBuilder()
	.setPort(1340)
	.build();

const srocket = new SRocket(config);

class ModelRequest extends Model {
	@ModelProp()
	@v.IsDefined({ message: 'The userName must be defined!' })
	@v.IsNotEmpty({ message: 'The userName must not be empty!' })
	@v.IsString({ message: 'The userName must be a string' })
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
			type: String, rules: [{ rule: jv.contains, args: ['patrick'] }]
		}
	}
})
class DataRoute extends Route {
	onValidationError(error: Error) {
		console.log('"/param" -> Validation error caught!', error.message);
	}

	on(req: Request<ModelRequest>, res: Response) {
		console.log('GOT CALL TO: /param -> with: ', req.data);
	}
}

srocket.router.register(ModelRoute);
srocket.router.register(DataRoute);

srocket.listen(() => {
	console.log(`Server is listening on ${srocket.getConfig().port}`);
});
