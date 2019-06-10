import { ResponseContext } from "../ResponseContext";

import { EmitInvokeSyntax } from "./EmitInvokeSyntax";
import { ServerOmitSenderEmitSyntax } from "./ServerOmitSenderEmitSyntax";
import { ServerIncludeSenderEmitSyntax } from "./ServerIncludeSenderEmitSyntax";

export class AllEmitSyntax implements EmitInvokeSyntax {
	protected readonly context: ResponseContext;

	public readonly exceptSender: {
		in: ServerOmitSenderEmitSyntax;
	};

	public readonly in: ServerIncludeSenderEmitSyntax;

	public constructor(context: ResponseContext) {
		this.context = context;
		this.exceptSender = { in: new ServerOmitSenderEmitSyntax(context) };
		this.in = new ServerIncludeSenderEmitSyntax(context);
	}

	public emit(eventName: string): void {
		this.context.proxyEmit(eventName, this.context.server.emit);
	}
}
