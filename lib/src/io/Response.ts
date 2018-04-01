import { StatusCodes } from "./StatusCode";
import { InternalRoute } from "../router/InternalRoute";

export class Response<T = any> {
	protected emitEventName: string;
	protected statusCode: number;
	protected data?: T;
	protected payloadMessage: string;
	protected socket: SocketIO.Socket;
	protected route: InternalRoute;
	protected server: SocketIO.Server;

	constructor(socket: SocketIO.Socket, route: InternalRoute, server: SocketIO.Server) {
		this.socket = socket;
		this.server = server;

		this.payloadMessage = "";
		this.statusCode = 200;
		this.route = route;
	}

	// -- Fluent properties.

	public eventName(eventName: string) {
		this.emitEventName = eventName;
		return this;
	}

	public status(code: number) {
		this.statusCode = code;
		return this;
	}

	public getStatus() {
		return this.statusCode;
	}

	public withData(obj: T) {
		this.data = obj;
		return this;
	}

	public getData() {
		return this.data;
	}

	public message(comment: string) {
		this.payloadMessage = comment;
		return this;
	}

	public getMessage() {
		return this.payloadMessage;
	}

	public error(error: Error) {
		if (this.getStatus() < 499) {
			this.status(StatusCodes.INTERNAL_SERVER_ERROR);
		}

		this.message(error.message).relay();
	}

	// -- Sender functions

	public relay() {
		this.socket.emit(this.getEventRoute(), this.formatPayload());
	}

	public toAllExceptSender() {
		this.socket.broadcast.emit(this.getEventRoute(), this.formatPayload());
	}

	public toAllInRoom_ExceptSender(roomName: string) {
		// TODO: Support emit to multiple rooms -> Builder ?
		this.socket.to(roomName).emit(this.getEventRoute(), this.formatPayload());
	}

	public toAllInRoom(roomName: string) {
		this.server.in(roomName).emit(this.getEventRoute(), this.formatPayload());
	}

	public toAllInNamespace(namespaceName: string = "/") {
		this.server.of(namespaceName).emit(this.getEventRoute(), this.formatPayload());
	}

	public toIndividualSocket(socketID: string) {
		this.socket.to(socketID).emit(this.getEventRoute(), this.formatPayload());
	}

	// -- Misc Getters.

	public getSocket() {
		return this.socket;
	}

	// -- Private Helpers

	protected getEventRoute() {
		if (!this.emitEventName) {
			return this.route.config.path;
		} else {
			return this.emitEventName;
		}
	}

	protected formatPayload() {
		return {
			message: this.getMessage(),
			status: this.getStatus(),
			payload: this.getData()
		};
	}
}
