import { Route } from "../router/Route";
import { InternalRoute } from "../router/InternalRoute";
import { ResponseContext } from "./ResponseContext";

import { TopLevelEmitSyntax } from "./syntax/TopLevelEmitSyntax";

/**
 * The Response type for SRocket
 */
export class SResponse<T = any> {
	protected context: ResponseContext;

	public to: TopLevelEmitSyntax;

	/**
	 * Creates an instance of SResponse.
	 */
	public constructor(
		socket: SocketIO.Socket,
		route: InternalRoute<Route>,
		server: SocketIO.Server,
		ack: Function | null
	) {
		this.context = new ResponseContext(socket, server, route, ack);
		this.to = new TopLevelEmitSyntax(this.context);
	}

	// -- Fluent properties.

	public status(code: number): this {
		this.context.statusCode = code;

		return this;
	}

	public message(comment: string): this {
		this.context.payloadMessage = comment;

		return this;
	}

	public data(data: T): this {
		this.context.data = data;

		return this;
	}

	// Getters

	public getData(): any {
		return this.context.data;
	}

	public getStatus(): number {
		return this.context.statusCode;
	}

	public getMessage(): string {
		return this.context.payloadMessage;
	}

	// -- Util

	public get hasAck(): boolean {
		return !!this.context.ack;
	}

	// -- Sender functions

	/**
	 * Invokes the ack of the request.
	 *
	 * If there is no ack - no action will be performed.
	 */
	public acknowledge(): void {
		if (this.context.ack && this.hasAck) {
			this.context.ack(this.context.formatPayload());
		}

		// TODO: Probably add some handling here
	}

	// -- Misc Getters.

	/**
	 * Gets the underlying socket.io socket instance
	 */
	public getSocket(): SocketIO.Socket {
		return this.context.socket;
	}
}
