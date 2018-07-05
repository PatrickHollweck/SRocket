import { Newable } from "../structures/Newable";
import { SRequest } from "../io/SRequest";
import { container } from "..";
import { SResponse } from "../io/SResponse";
import { Middleware } from "../middleware/Middleware";
import { ExecutionContext } from "../config/ExecutionContext";
import { RouteMetadataStore, ControllerMetadata, RouteMetadata, Controller } from "./metadata/RouteMetadataStore";

export class Router {
	protected readonly ioServer: SocketIO.Server;
	protected readonly context: ExecutionContext;

	constructor() {
		this.ioServer = container.get("ioServer");
		this.context = container.get(ExecutionContext);
	}

	public registerRoutes() {
		const store = container.get(RouteMetadataStore);
		store.controllers.forEach(controller => this.registerController(controller));
	}

	protected registerController(controller: ControllerMetadata) {
		const namespace = this.ioServer.of(controller.config.namespace);
		this.handleConnection(namespace, controller);
	}

	protected handleConnection(namespace: SocketIO.Namespace, controller: ControllerMetadata) {
		namespace.on("connect", socket => {
			controller.connectHandlers.forEach(handler => {
				handler.callOn(new SRequest({}, socket));
			});

			socket.on("disconnect", () => {
				controller.disconnectHandlers.forEach(handler => {
					handler.callOn(new SRequest({}, socket));
				});
			});

			controller.messageRoutes.forEach(route => {
				socket.on(
					route.config.path,
					async (...requestData: any[]) => await this.invokeRoute(socket, route, controller, requestData)
				);
			});
		});
	}

	protected async invokeRoute(
		socket: SocketIO.Socket,
		route: RouteMetadata,
		controller: ControllerMetadata,
		requestData: any[]
	) {
		const lastRequestArg = requestData[requestData.length - 1];
		const ack = typeof lastRequestArg === "function" ? lastRequestArg : null;

		const request = new SRequest(requestData, socket);
		const response = new SResponse(socket, route.handler, this.ioServer, ack);

		const shouldInvokeRoute = await this.invokeMiddleware(request, response, route, controller);

		console.log(shouldInvokeRoute);

		if (!shouldInvokeRoute) {
			return;
		}

		// TODO: Some option to not catch errors and let them crash the app. @SocketRoute and SRocket startup ?
		try {
			await route.handler.callOn(request, response);
		} catch (e) {
			await route.handler.callError(e, request, response);
		}
	}

	protected async invokeMiddleware(
		request: SRequest,
		response: SResponse,
		route: RouteMetadata,
		controller: ControllerMetadata
	) {
		const middlewares = this.getMiddlewares(route, controller) as Newable<Middleware>[];

		for (const [index, middleware] of middlewares.entries()) {
			let called = false;

			const next = () => {
				called = true;
			};

			await new middleware().invoke(request, response, route, next);

			if (!called) {
				return false;
			}
		}

		return true;
	}

	protected getMiddlewares(route: RouteMetadata, controller: ControllerMetadata) {
		return [...this.context.globalMiddleware, ...controller.config.middleware, ...route.config.middleware];
	}
}
