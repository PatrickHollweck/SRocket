import { container } from "..";
import { RouteMetadataStore, ControllerMetadata, RouteMetadata } from "./metadata/RouteMetadataStore";
import { SRequest } from "../io/SRequest";
import { SResponse } from "../io/SResponse";

export class Router {
	protected ioServer: SocketIO.Server;

	constructor(ioServer: SocketIO.Server) {
		this.ioServer = ioServer;
	}

	public registerRoutes() {
		const store = container.get(RouteMetadataStore);
		store.controllers.forEach(controller => this.registerController(controller));
	}

	protected registerController(controller: ControllerMetadata) {
		const namespace = this.ioServer.of(controller.namespace);

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

		await route.handler.callOn(request, response);
	}
}
