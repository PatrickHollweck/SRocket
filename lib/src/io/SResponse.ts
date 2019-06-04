import { Route } from "../router/Route";
import { StatusCodes } from "./StatusCode";
import { InternalRoute } from "../router/InternalRoute";

export type SocketIOAck = (...args: any[]) => void;

/**
 * The Response type for SRocketA
 *
 * @export
 * @class SResponse
 * @template T
 */
export class SResponse<T = any> {
	protected ack?: SocketIOAck;
	protected data?: T;
	protected route: InternalRoute<Route>;
	protected socket: SocketIO.Socket;
	protected server: SocketIO.Server;
	protected statusCode: number;
	protected emitEventName: string;
	protected payloadMessage: string;

	/**
	 * Creates an instance of SResponse.
	 *
	 * @param {SocketIO.Socket} socket The underlying socket
	 * @param {InternalRoute<Route>} route The event-name
	 * @param {SocketIO.Server} server The underlying server
	 * @param {SocketIOAck} [ack] The ack that was sent with the request, may be null
	 * @memberof SResponse
	 */
	public constructor(
		socket: SocketIO.Socket,
		route: InternalRoute<Route>,
		server: SocketIO.Server,
		ack?: SocketIOAck
	) {
		this.socket = socket;
		this.server = server;

		this.ack = ack;
		this.payloadMessage = "";
		this.statusCode = 200;
		this.route = route;
	}

	// -- Fluent properties.

	/**
	 * Sets the event-name that the response should respond with
	 *
	 * If you use any of the toXXX functions like `toAllInNamespace`
	 * this will control the name of the event that will be emitted.
	 *
	 *
	 * @param {string} eventName
	 * @returns {SResponse}
	 * @memberof SResponse
	 *
	 * @example
	 * response.eventName("user-joined").toAllInRoom()
	 *
	 * This will emit to all in the same room a event with the name "user-joined"
	 */
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

	public withData(data: T) {
		this.data = data;
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
			this.status(StatusCodes.InternalServerError);
		}

		this.message(error.message).toSender();
	}

	// -- Util

	public hasAck() {
		return !!this.ack;
	}

	// -- Sender functions

	/**
	 * Invokes the ack of the request.
	 *
	 * If there is no ack - no action will be performed.
	 *
	 * @memberof SResponse
	 */
	public acknowledge() {
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
	 *
	 * @memberof SResponse
	 */
	public toSender() {
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
	 *
	 * @memberof SResponse
	 */
	public toAllExceptSender() {
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
	 * @memberof SResponse
	 *
	 * @param {string} roomName
	 * @memberof SResponse
	 */
	public toAllInRoomExceptSender(roomName: string) {
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
	 * @memberof SResponse
	 *
	 * @param {string} roomName
	 * @memberof SResponse
	 */
	public toAllInRoom(roomName: string) {
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
	 * @memberof SResponse
	 *
	 * @param {string} roomName
	 * @memberof SResponse
	 */
	public toAllInNamespace(namespaceName: string = "/") {
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
	 * @memberof SResponse
	 *
	 * @param {string} roomName
	 * @memberof SResponse
	 */
	public toIndividualSocket(socketID: string) {
		this.socket.to(socketID).emit(this.getEventRoute(), this.formatPayload());
	}

	// -- Misc Getters.

	/**
	 * Gets the underlying socket.io socket instance
	 *
	 * @returns {SocketIO.Socket}
	 * @memberof SResponse
	 */
	public getSocket(): SocketIO.Socket {
		return this.socket;
	}

	// -- Helpers

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
