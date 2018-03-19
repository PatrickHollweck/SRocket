import * as sio from 'socket.io';
import * as sioWildcard from 'socketio-wildcard';

// Internal Use.
import { MiddlewareBase } from './Middleware/MiddlewareBase';
import Router, { RouterCallbackType } from './router/Router';
import SRocketConfig from './config/SRocketConfig';

// For exporting
import { Validator } from './validation/Validator';
import Model from './model/Model';
import Route from './router/Route';
import Request from './io/Request';
import Response from './io/Response';

export { Router, Route, Model, Validator, Response, Request };

export class SRocket {

	public router: Router;
	public ioServer: SocketIOExt.Server;

	protected config: SRocketConfig;

	public constructor(config: SRocketConfig) {
		this.ioServer = sio(config.serverConfig);
		this.config = config;
		this.router = new Router(this.ioServer);
	}

	public listen(callback?: Function) {
		this.ioServer.use(sioWildcard());

		this.ioServer.on('connection', socket => {
			socket.on('*', packet => {
				this.router.route(packet, socket);
			});
		});

		this.ioServer.listen(this.config.port);
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
		this.ioServer.close();
	}

	public getConfig() {
		return this.config;
	}
}