import { ControllerMetaInternalRoute } from "../InternalRoute";
import { ControllerConfig } from "../types/ControllerConfig";
import { RouteMetadata } from "./RouteMetadata";

export class ControllerMetadata {
	public messageRoutes: RouteMetadata[];
	public connectHandlers: ControllerMetaInternalRoute[];
	public disconnectHandlers: ControllerMetaInternalRoute[];
	public config: ControllerConfig | null;

	public constructor() {
		this.messageRoutes = [];
		this.connectHandlers = [];
		this.disconnectHandlers = [];

		this.config = null;
	}

	public addConnectHandler(handler: ControllerMetaInternalRoute): void {
		this.connectHandlers.push(handler);
	}

	public addDisconnectHandler(handler: ControllerMetaInternalRoute): void {
		this.disconnectHandlers.push(handler);
	}

	public addMessageRoute(route: RouteMetadata): void {
		this.messageRoutes.push(route);
	}
}
