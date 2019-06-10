import { ResponseContext } from "../ResponseContext";

export class ServerOmitSenderEmitSyntax {
	protected context: ResponseContext;
	protected target: SocketIO.Socket;

	public constructor(context: ResponseContext) {
		this.context = context;
		this.target = this.context.socket.broadcast;
	}

	public get compressed(): this {
		this.target = this.target.compress(true);

		return this;
	}

	public get uncompressed(): this {
		this.target = this.target.compress(false);

		return this;
	}

	public get volatile(): this {
		this.target = this.target.volatile;

		return this;
	}

	public room(...roomNames: string[]): this {
		roomNames.forEach(roomName => {
			this.target = this.target.in(roomName);
		});

		return this;
	}

	public emit(eventName: string): void {
		this.context.proxyEmit(eventName, this.target.emit);
	}
}
