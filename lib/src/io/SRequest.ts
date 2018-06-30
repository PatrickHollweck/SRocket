import { SocketPacket } from "../structures/SocketPacket";

export class SRequest<T = any> {
	public socket: SocketIO.Socket;
	public data: T;

	constructor(data: T, socket: SocketIO.Socket) {
		this.data = data;
		this.socket = socket;
	}
}
