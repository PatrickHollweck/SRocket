import { Route } from "../router/Route";
import { StatusCodes } from "./StatusCode";
import { InternalRoute } from "../router/InternalRoute";

export type SocketIOAck = (...args: any[]) => void;

/**
 * The Response type for SRocket
 *
 * @export
 */
export class SResponse<T = any> {
	protected ack: SocketIOAck | null;
	protected data?: T;
	protected route: InternalRoute<Route>;
	protected socket: SocketIO.Socket;
	protected server: SocketIO.Server;
	protected statusCode: number;
	protected emitEventName: string | null;
	protected payloadMessage: string;

	/**
	 * Creates an instance of SResponse.
	 *
	 * @param [socket] The underlying socket
	 * @param [route] The event-name
	 * @param [server] The underlying server
	 * @param [ack] The ack that was sent with the request, may be null
	 */
	public constructor(
		socket: SocketIO.Socket,
		route: InternalRoute<Route>,
		server: SocketIO.Server,
		ack: SocketIOAck | null
	) {
		this.socket = socket;
		this.server = server;

		this.ack = ack;
		this.payloadMessage = "";
		this.statusCode = StatusCodes.Ok;
		this.route = route;

		this.emitEventName = null;
	}

	// -- Fluent properties.

	/**
	 * Sets the event-name that the response should respond with
	 *
	 * If you use any of the toXXX functions like `toAllInNamespace`
	 * this will control the name of the event that will be emitted.
	 *
	 *
	 * @param [eventName] The event-name to emit
	 *
	 * @example
	 * response.eventName("user-joined").toAllInRoom()
	 *
	 * This will emit to all in the same room a event with the name "user-joined"
	 */
	public eventName(eventName: string): SResponse {
		this.emitEventName = eventName;

		return this;
	}

	public status(code: number): SResponse {
		this.statusCode = code;

		return this;
	}

	public getStatus(): number {
		return this.statusCode;
	}

	public withData(data: T): SResponse {
		this.data = data;

		return this;
	}

	public getData(): any {
		return this.data;
	}

	public message(comment: string): SResponse {
		this.payloadMessage = comment;

		return this;
	}

	public getMessage(): string {
		return this.payloadMessage;
	}

	public error(error: Error): void {
		if (this.getStatus() < StatusCodes.InternalServerError) {
			this.status(StatusCodes.InternalServerError);
		}

		this.message(error.message).toSender();
	}

	// -- Util

	public hasAck(): boolean {
		return !!this.ack;
	}

	// -- Sender functions

	/**
	 * Invokes the ack of the request.
	 *
	 * If there is no ack - no action will be performed.
	 */
	public acknowledge(): void {
		if (this.ack) {
			this.ack(this.getData());
		} else {
			// TODO: Probably add some handling here
		}
	}

	/**
	 * Emits a event with the path of the request to only the sender of the request.
	 *
	 * @example
	 * // CLient
	 * socket.emit("greet", { ... });
	 * // Server
	 * event.response.toSender();
	 * // Client
	 * socket.on("greet", () => console.log("Fired!"));
	 * >> Fired!
	 */
	public toSender(): void {
		this.socket.emit(this.getEventRoute(), this.formatPayload());
	}

	/**
	 * Emits a event with the path of the request to all but the sender of the request.
	 *
	 * @example
	 * // CLient
	 * socket.emit("greet", { ... });
	 * // Server
	 * event.response.toAllExceptSender();
	 * // Client
	 * otherSocket.on("greet", () => console.log("Fired!"));
	 * >> Fired!
	 */
	public toAllExceptSender(): void {
		this.socket.broadcast.emit(this.getEventRoute(), this.formatPayload());
	}

	/**
	 * Emits a event with the path of the request to all in a room but the sender.
	 *
	 * @example
	 * // CLient
	 * socket.emit("greet", { ... });
	 * // Server
	 * event.response.toAllInRoomExceptSender();
	 * // Client
	 * otherSocket.on("greet", () => console.log("Fired!"));
	 * >> Fired!
	 *
	 * @param [roomName] The name of the room to emit to
	 */
	public toAllInRoomExceptSender(roomName: string): void {
		this.socket.to(roomName).emit(this.getEventRoute(), this.formatPayload());
	}

	/**
	 * Emits a event with the path of the request to all in the room.
	 *
	 * @example
	 * // CLient
	 * socket.emit("greet", { ... });
	 * // Server
	 * event.response.toAllInRoom();
	 * // Client
	 * socket.on("greet", () => console.log("Fired!"));
	 * >> Fired!
	 *
	 * @param [roomName] The name of the room to emit to
	 */
	public toAllInRoom(roomName: string): void {
		this.server.in(roomName).emit(this.getEventRoute(), this.formatPayload());
	}

	/**
	 * Emits a event with the path of the request to all in a namespace.
	 *
	 * @example
	 * // CLient
	 * socket.emit("greet", { ... });
	 * // Server
	 * event.response.toAllInNamespace();
	 * // Client
	 * socket.on("greet", () => console.log("Fired!"));
	 * >> Fired!
	 *
	 * @param [namespaceName] The name of the namespace to emit to
	 */
	public toAllInNamespace(namespaceName: string = "/"): void {
		this.server.of(namespaceName).emit(this.getEventRoute(), this.formatPayload());
	}

	/**
	 * Emits a event with the path of the request to a individual socket
	 *
	 * @example
	 * // CLient
	 * socket.emit("greet", { ... });
	 * // Server
	 * event.response.toIndividualSocket();
	 * // Client
	 * otherSocket.on("greet", () => console.log("Fired!"));
	 * >> Fired!
	 *
	 * @param [socketID] The socket io to emit to
	 */
	public toIndividualSocket(socketID: string): void {
		this.socket.to(socketID).emit(this.getEventRoute(), this.formatPayload());
	}

	// -- Misc Getters.

	/**
	 * Gets the underlying socket.io socket instance
	 */
	public getSocket(): SocketIO.Socket {
		return this.socket;
	}

	// -- Helpers

	protected getEventRoute(): string {
		if (!this.emitEventName) {
			return this.route.config.path;
		} else {
			return this.emitEventName;
		}
	}

	protected formatPayload(): { message: string; status: number; payload: any } {
		return {
			message: this.getMessage(),
			status: this.getStatus(),
			payload: this.getData()
		};
	}
}
