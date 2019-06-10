import { ResponseContext } from "../ResponseContext";

import { SocketEmitSyntax } from "./SocketEmitSyntax";
import { AllEmitSyntax } from "./AllEmitSyntax";

export class TopLevelEmitSyntax {
	public readonly sender: SocketEmitSyntax;
	public readonly all: AllEmitSyntax;

	public constructor(context: ResponseContext) {
		this.sender = new SocketEmitSyntax(context);
		this.all = new AllEmitSyntax(context);
	}
}
