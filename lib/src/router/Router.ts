import { container } from "..";
import { RouteMetadataStore, ControllerMetadata, RouteMetadata } from "./metadata/RouteMetadataStore";
import { SRequest } from "../io/SRequest";
import { SResponse } from "../io/SResponse";

export class Router {
	protected readonly ioServer: SocketIO.Server;

	constructor(ioServer: SocketIO.Server) {
		if (!ioServer) {
			throw new Error("Router initialized with a undefined socket server!");
		}

		this.ioServer = ioServer;
	}

	public registerRoutes() {
		const store = container.get(RouteMetadataStore);
		store.controllers.forEach(controller => this.registerController(controller));
	}

	protected registerController(controller: ControllerMetadata) {
		const namespace = this.ioServer.of(controller.namespace);
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
					async (...requestData: any[]) => await this.invokeRoute(socket, route, requestData)
				);
			});
		});
	}

	protected async invokeRoute(socket: SocketIO.Socket, route: RouteMetadata, requestData: any[]) {
		const lastRequestArg = requestData[requestData.length - 1];
		const ack = typeof lastRequestArg === "function" ? lastRequestArg : null;

		const request = new SRequest(requestData, socket);
		const response = new SResponse(socket, route.handler, this.ioServer, ack);

		this.invokeMiddleware(request, response);

		// TODO: Some option to not catch errors and let them crash the app. @SocketRoute and SRocket startup ?
		try {
			await route.handler.callOn(request, response);
		} catch (e) {
			await route.handler.callError(e, request, response);
		}
	}

	protected async invokeMiddleware(request: SRequest, response: SResponse) {}
}
