import { container } from "..";
import { RouteMetadataStore, ControllerMetadata, RouteMetadata, Route } from "./metadata/RouteMetadataStore";

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
			controller.routes.forEach(route => {
				socket.on(route.name, async () => await this.executeRoute(socket, route));
			});
		});
	}

	protected async executeRoute(socket: SocketIO.Socket, route: RouteMetadata) {
		await route.handler.callOn();
	}
}
