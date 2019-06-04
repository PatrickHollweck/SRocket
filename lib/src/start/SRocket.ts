import { RuntimeConfiguration } from "../config/RuntimeConfiguration";
import { RouteMetadataStore } from "../router/metadata/RouteMetadataStore";
import { Middleware } from "../middleware/Middleware";
import { Controller } from "../router/Controller";
import { container } from "../di/SRocketContainer";
import { Container } from "inversify";
import { Newable } from "../structures/Newable";
import { Router } from "../router/Router";

import * as socketIO from "socket.io";
import { LogLevel } from "../logging/Logger";

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

	public static fromIO(server: SocketIO.Server): SRocket {
		return new SRocket(server);
	}

	public static fromPort(port: number, config?: SocketIO.ServerOptions): SRocket {
		return new SRocket(socketIO.listen(port, config));
	}

	public setSeparationConvention(separator: string): SRocket {
		container.get(RuntimeConfiguration).separationConvention = separator;

		return this;
	}

	public setLogLevel(level: LogLevel): SRocket {
		this.startupChain.push(() => {
			container.get(RuntimeConfiguration).logLevel = level;
		});

		return this;
	}

	public addGlobalMiddleware(
		before: Newable<Middleware>[],
		after: Newable<Middleware>[]
	): SRocket {
		this.startupChain.push(() => {
			const context = container.get(RuntimeConfiguration);
			context.beforeGlobalMiddleware.push(...before);
			context.afterGlobalMiddleware.push(...after);
		});

		return this;
	}

	public configureContainer(fn: (container: Container) => void): SRocket {
		this.startupChain.push(() => {
			fn(container);
		});

		return this;
	}

	public controllers(...controllers: Newable<Controller>[]): SRocket {
		this.startupChain.push(() => {
			for (const controller of controllers) {
				container.get(RouteMetadataStore).buildController(controller);
			}
		});

		return this;
	}

	public async listen(callback?: (app: SRocket) => void): Promise<SRocket> {
		for (const fn of this.startupChain) {
			await fn();
		}

		container.get(Router).registerRoutes();

		if (callback) {
			callback(this);
		}

		return this;
	}

	public close(): void {
		container.get<SocketIO.Server>("ioServer").close();
		// TODO: The container should to be instance based...
		container.unbindAll();
	}
}
