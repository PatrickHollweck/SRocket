// tslint:disable-next-line:no-reference
/// <reference path="./typings/types.d.ts" />

import * as sio from "socket.io";
import * as sioWildcard from "socketio-wildcard";

import { MiddlewareBase } from "./middleware";
import { Config } from "./config";
import { Router, RouterCallbackType } from "./router";

export class SRocket {
	public router: Router;
	public ioServer: SocketIO.Server;

	protected config: Config;

	public constructor(config: Config) {
		this.config = config;
		this.ioServer = sio.listen(config.serverConfig);
		this.router = new Router(this.ioServer);
	}

	public listen(callback?: Function) {
		this.ioServer.use(sioWildcard());

		this.ioServer.on("connection", socket => {
			socket.on("*", async packet => {
				await this.router.route(packet, socket);
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
