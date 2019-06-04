import { RuntimeConfiguration } from "../config/RuntimeConfiguration";
import { MiddlewareList } from "../middleware/Middleware";
import { ConsoleLogger } from "../logging/ConsoleLogger";
import { SResponse } from "../io/SResponse";
import { container } from "..";
import { SRequest } from "../io/SRequest";

import { RouteMetadataStore } from "./metadata/RouteMetadataStore";
import { ControllerMetadata } from "./metadata/ControllerMetadata";
import { RouteMetadata } from "./metadata/RouteMetadata";
import { extractAck } from "../utility/Types";

export class Router {
	protected readonly ioServer: SocketIO.Server;
	protected readonly context: RuntimeConfiguration;
	protected readonly logger: ConsoleLogger;

	public constructor() {
		this.ioServer = container.get("ioServer");
		this.context = container.get(RuntimeConfiguration);

		this.logger = new ConsoleLogger("Router");
	}

	public registerRoutes(): void {
		const store = container.get(RouteMetadataStore);
		store.getControllers().forEach(controller => this.registerController(controller));
	}

	protected registerController(controller: ControllerMetadata): void {
		const namespace = this.ioServer.of(controller.config.namespace);
		this.handleConnection(namespace, controller);
	}

	protected handleConnection(
		namespace: SocketIO.Namespace,
		controller: ControllerMetadata
	): void {
		namespace.on("connect", socket => {
			controller.connectHandlers.forEach(handler => {
				handler.callOn(new SRequest({}, "connect", socket));
			});

			socket.on("disconnect", () => {
				controller.disconnectHandlers.forEach(handler => {
					handler.callOn(new SRequest({}, "disconnect", socket));
				});
			});

			controller.messageRoutes.forEach(route => {
				this.logger.debug(JSON.stringify(route.config, null, 4));
				socket.on(route.config.path, async (...requestData: any[]) =>
					this.invokeRoute(socket, route, controller, requestData)
				);
			});
		});
	}

	protected async invokeRoute(
		socket: SocketIO.Socket,
		route: RouteMetadata,
		controller: ControllerMetadata,
		requestData: any[]
	): Promise<void> {
		const { ack } = extractAck(requestData);

		const request = new SRequest(requestData, route.config.path, socket);
		const response = new SResponse(socket, route.handler, this.ioServer, ack);

		const shouldInvokeRoute = await this.invokeMiddleware(
			request,
			response,
			route,
			this.getBeforeMiddleware(route, controller)
		);

		if (!shouldInvokeRoute) {
			return;
		}

		// TODO: Some option to not catch errors and let them crash the app. @SocketRoute and SRocket startup ?
		try {
			await route.handler.callOn(request, response);
		} catch (e) {
			await route.handler.callError(e, request, response);
		}

		await this.invokeMiddleware(
			request,
			response,
			route,
			this.getAfterMiddlewares(route, controller)
		);
	}

	protected async invokeMiddleware(
		request: SRequest,
		response: SResponse,
		route: RouteMetadata,
		middlewares: MiddlewareList
	): Promise<boolean> {
		for (const middleware of middlewares) {
			let called = false;

			const next = () => {
				called = true;
			};

			if (typeof middleware === "function") {
				await new middleware().invoke(request, response, route, next);
			} else {
				await middleware.invoke(request, response, route, next);
			}

			if (!called) {
				return false;
			}
		}

		return true;
	}

	protected getBeforeMiddleware(
		route: RouteMetadata,
		controller: ControllerMetadata
	): MiddlewareList {
		return [
			...this.context.beforeGlobalMiddleware,
			...controller.config.beforeMiddleware,
			...route.config.beforeMiddleware
		];
	}

	protected getAfterMiddlewares(
		route: RouteMetadata,
		controller: ControllerMetadata
	): MiddlewareList {
		return [
			...this.context.afterGlobalMiddleware,
			...controller.config.afterMiddleware,
			...route.handler.config.afterMiddleware
		];
	}
}
