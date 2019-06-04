import { ControllerMetaInternalRoute } from "../InternalRoute";
import { ControllerConfig } from "../types/ControllerConfig";
import { RouteMetadata } from "./RouteMetadata";

export class ControllerMetadata {
	public messageRoutes: RouteMetadata[];
	public connectHandlers: ControllerMetaInternalRoute[];
	public disconnectHandlers: ControllerMetaInternalRoute[];
	public config: ControllerConfig;

	public constructor() {
		this.messageRoutes = [];
		this.connectHandlers = [];
		this.disconnectHandlers = [];
	}

	public addConnectHandler(handler: ControllerMetaInternalRoute) {
		this.connectHandlers.push(handler);
	}

	public addDisconnectHandler(handler: ControllerMetaInternalRoute) {
		this.disconnectHandlers.push(handler);
	}

	public addMessageRoute(route: RouteMetadata) {
		this.messageRoutes.push(route);
	}
}
