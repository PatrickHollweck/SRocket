import { Request, Response } from "./";
import { InternalRoute } from "../router/InternalRoute";
import { TypedPair } from "../structures/Pair";

export class IOFactory {
	public static make(data: any, socket: SocketIO.Socket, server: SocketIO.Server, route: InternalRoute) {
		const request = new Request(data, socket);
		const response = new Response(socket, route, server);

		return new TypedPair<Request, Response>(request, response);
	}
}
