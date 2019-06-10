import { ResponseContext } from "../ResponseContext";
import { EmitInvokeSyntax } from "./EmitInvokeSyntax";

export class SocketEmitSyntax implements EmitInvokeSyntax {
	protected context: ResponseContext;
	protected target: SocketIO.Socket;

	public constructor(context: ResponseContext) {
		this.context = context;
		this.target = this.context.socket;
	}

	public get compressed(): SocketEmitSyntax {
		this.target = this.target.compress(true);

		return this;
	}

	public get uncompressed(): SocketEmitSyntax {
		this.target = this.target.compress(false);

		return this;
	}

	public get volatile(): SocketEmitSyntax {
		this.target = this.target.volatile;

		return this;
	}

	public emit(eventName: string): void {
		this.context.proxyEmit(eventName, this.target.emit);
	}
}
