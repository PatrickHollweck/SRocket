import { Router } from "../router/Router";
import { Newable } from "../structures/Newable";
import { Container } from "inversify";
import { container } from "../di/SRocketContainer";
import { Middleware } from "../middleware/Middleware";
import { ExecutionContext } from "../config/ExecutionContext";
import { RouteMetadataStore, Controller } from "../router/metadata/RouteMetadataStore";
import { Autoloader, AutoloadResult, IAutoloader } from "autoloader-ts";

import * as socketIO from "socket.io";

export class SRocket {
	public readonly ioServer: SocketIO.Server;

	protected readonly router: Router;
	protected readonly startupChain: Function[];

	private constructor(ioServer: SocketIO.Server) {
		container.bind(ExecutionContext).toConstantValue(new ExecutionContext());
		container.bind(RouteMetadataStore).toConstantValue(new RouteMetadataStore());

		this.startupChain = [];

		this.ioServer = ioServer;
		this.router = new Router(this.ioServer);
	}

	static fromIO(server: SocketIO.Server) {
		return new SRocket(server);
	}

	static fromPort(port: number, config?: SocketIO.ServerOptions) {
		return new SRocket(socketIO(port, config));
	}

	public addGlobalMiddleware(...middleware: Newable<Middleware>[]) {
		this.startupChain.push(() => {
			container.get(ExecutionContext).globalMiddleware.push(...middleware);
		});

		return this;
	}

	public configureContainer(fn: (container: Container) => void) {
		this.startupChain.push(() => {
			fn(container);
		});
	}

	public autoloadControllers(fn: (autoloader: IAutoloader) => Promise<void>) {
		this.startupChain.push(async () => {
			const autoloader = await Autoloader.dynamicImport();
			await fn(autoloader);

			this.controllers(...autoloader.getResult().exports);
		});

		return this;
	}

	public controllers(...controllers: Newable<Controller>[]) {
		this.startupChain.push(() => {
			for (const controller of controllers) {
				container.get(RouteMetadataStore).buildController(controller);
			}
		});

		return this;
	}

	public async listen(callback?: Function) {
		for (const fn of this.startupChain) {
			await fn();
		}

		this.router.registerRoutes();

		if (callback) {
			callback();
		}
	}
}
