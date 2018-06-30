import { Router } from "../router/Router";
import { Newable } from "../structures/Newable";
import { container } from "../di/SRocketContainer";
import { AppConfig } from "../config/AppConfig";
import { Middleware } from "../middleware/Middleware";
import { RouteMetadataStore, Controller } from "../router/metadata/RouteMetadataStore";

import * as socketIO from "socket.io";

export class SRocket {
	protected readonly ioServer: SocketIO.Server;
	protected readonly router: Router;

	private constructor(ioServer: SocketIO.Server) {
		container.bind(AppConfig).toConstantValue(new AppConfig());
		container.bind(RouteMetadataStore).toConstantValue(new RouteMetadataStore());

		this.ioServer = ioServer;
		this.router = new Router(this.ioServer);
	}

	static fromIO(server: SocketIO.Server) {
		return new SRocket(server);
	}

	static fromPort(port: number, config?: SocketIO.ServerOptions) {
		return new SRocket(socketIO(port, config));
	}

	public addGlobalMiddleware(...middleware: Middleware[]) {
		container.get(AppConfig).globalMiddleware.push(...middleware);
		return this;
	}

	public controllers(...controllers: Newable<Controller>[]) {
		for (const controller of controllers) {
			container.get(RouteMetadataStore).buildController(controller);
		}

		return this;
	}

	public listen() {
		this.router.registerRoutes();
	}
}
