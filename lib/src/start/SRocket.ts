import { Autoloader, IAutoloader } from "autoloader-ts";
import { RouteMetadataStore } from "../router/metadata/RouteMetadataStore";
import { RuntimeConfiguration } from "../config/ExecutionContext";
import { Middleware } from "../middleware/Middleware";
import { Controller } from "../router/Controller";
import { container } from "../di/SRocketContainer";
import { Container } from "inversify";
import { Newable } from "../structures/Newable";
import { Router } from "../router/Router";

import * as socketIO from "socket.io";

export class SRocket {
	public readonly container: Container;

	protected readonly startupChain: VoidFunction[];

	private constructor(ioServer: SocketIO.Server) {
		this.startupChain = [];
		this.container = container;

		container.bind("ioServer").toConstantValue(ioServer);
		container.bind(RuntimeConfiguration).toConstantValue(new RuntimeConfiguration());
		container.bind(RouteMetadataStore).toConstantValue(new RouteMetadataStore());
		container.bind(Router).toConstantValue(new Router());
	}

	public static fromIO(server: SocketIO.Server) {
		return new SRocket(server);
	}

	public static fromPort(port: number, config?: SocketIO.ServerOptions) {
		return new SRocket(socketIO.listen(port, config));
	}

	public setSeparationConvention(separator: string) {
		container.get(RuntimeConfiguration).separationConvention = separator;
		return this;
	}

	public addGlobalMiddleware(before: Newable<Middleware>[], after: Newable<Middleware>[]) {
		this.startupChain.push(() => {
			const context = container.get(RuntimeConfiguration);
			context.beforeGlobalMiddleware.push(...before);
			context.afterGlobalMiddleware.push(...after);
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

	public async listen(callback?: (app: SRocket) => void) {
		for (const fn of this.startupChain) {
			await fn();
		}

		container.get(Router).registerRoutes();

		if (callback) {
			callback(this);
		}

		return this;
	}

	public close() {
		container.get<SocketIO.Server>("ioServer").close();
		// TODO: The container should to be instance based...
		container.unbindAll();
	}
}
