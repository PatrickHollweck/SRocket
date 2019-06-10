import { Omit } from "../../structures/Omit";
import { ResponseContext } from "../ResponseContext";

export class ServerIncludeSenderEmitSyntax {
	protected context: ResponseContext;
	protected target: SocketIO.Namespace;

	public constructor(context: ResponseContext) {
		this.context = context;
		this.target = this.context.server.of(this.context.socket.nsp.name);
	}

	public get compressed(): this {
		this.target = this.target.compress(true);

		return this;
	}

	public get uncompressed(): this {
		this.target = this.target.compress(false);

		return this;
	}

	public namespace(namespaceName: string): Omit<this, "namespace"> {
		this.target = this.context.server.of(namespaceName);

		return this;
	}
	public specificSocket(id: string): this {
		this.target = this.target.to(id);

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
