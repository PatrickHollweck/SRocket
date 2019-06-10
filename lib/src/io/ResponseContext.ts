import { Route } from "../router/Route";
import { StatusCodes } from "./StatusCode";
import { InternalRoute } from "../router/InternalRoute";

export class ResponseContext {
	public ack: Function | null;
	public data?: any;

	public socket: SocketIO.Socket;
	public server: SocketIO.Server;

	public route: InternalRoute<Route>;

	public statusCode: number;
	public emitEventName: string | null;
	public payloadMessage: string;

	public constructor(
		socket: SocketIO.Socket,
		server: SocketIO.Server,
		route: InternalRoute<Route>,
		ack: Function | null
	) {
		this.socket = socket;
		this.server = server;

		this.route = route;

		this.ack = ack;
		this.data = null;

		this.statusCode = StatusCodes.Ok;
		this.emitEventName = null;
		this.payloadMessage = "";
	}

	public proxyEmit(eventName: string, target: (event: string, ...args: any[]) => any): void {
		this.emitEventName = eventName;
		target(this.getEventRoute(), this.formatPayload());
	}

	public getEventRoute(): string {
		if (!this.emitEventName) {
			return this.route.config.path;
		} else {
			return this.emitEventName;
		}
	}

	public formatPayload(): {
		message: string;
		status: number;
		payload: any;
	} {
		return {
			message: this.payloadMessage,
			status: this.statusCode,
			payload: this.data
		};
	}
}
