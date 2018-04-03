import { SocketPacket } from "../structures/SocketPacket";

export class Request<T = any> {
	public socket: SocketIO.Socket;
	public packet: SocketPacket;
	public data: T;

	constructor(data: T, socket: SocketIO.Socket, packet: SocketIO.Packet) {
		this.packet = SocketPacket.fromSocketIOPacket(packet);
		this.data = this.packet.getUserData();
		this.socket = socket;
	}
}
