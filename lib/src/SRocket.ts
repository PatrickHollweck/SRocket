import * as sio from 'socket.io';
import * as sioWildcard from 'socketio-wildcard';

// Internal Use.
import Router, { RouterCallbackType } from 'src/router/Router';
import SRocketConfig from 'src/config/SRocketConfig';
import MiddlewareBase from 'src/Middleware/BaseMiddleware';

// For exporting
import { Validator } from 'src/validation/Validator';
import Model from 'src/model/Model';
import Route from 'src/router/Route';
import Request from 'src/io/Request';
import Response from 'src/io/Response';

export { Router, Route, Model, Validator, Response, Request };

export class SRocket {

	public router: Router;

	protected io: SocketIOExt.Server;
	protected config: SRocketConfig;

	public constructor(config: SRocketConfig) {
		this.io = sio();
		this.config = config;
		this.router = new Router(this.io);
	}

	public listen(callback?: Function) {
		this.io.use(sioWildcard());

		this.io.on('connection', socket => {
			socket.on('*', packet => {
				this.router.route(packet, socket);
			});
		});

		this.io.listen(this.config.port);
		if (callback) {
			callback();
		}
	}

	public use(middleware: MiddlewareBase) {
		this.router.registerCallback(RouterCallbackType.VALIDATION_ERROR, middleware.onEventValidationError);
		this.router.registerCallback(RouterCallbackType.BEFORE_EVENT, middleware.beforeEventCall);
		this.router.registerCallback(RouterCallbackType.AFTER_EVENT, middleware.afterEventCall);
	}

	public shutdown() {
		this.io.close();
	}

	public getConfig() {
		return this.config;
	}
}