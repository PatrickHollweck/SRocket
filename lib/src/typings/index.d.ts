import * as SocketIO from "socket.io";

declare module "socket.io" {
	interface Ack {
		(...args: any[]): void;
	}
}
