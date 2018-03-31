export class Request<T = any> {
	public socket: SocketIO.Socket;
	public packet: SocketIO.Packet;
	public data: T;

	constructor(
		data: T,
		socket: SocketIO.Socket,
		packet: SocketIO.Packet
	) {
		this.data = data;
		this.socket = socket;
		this.packet = packet;
	}
}
