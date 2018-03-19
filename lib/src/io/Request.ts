
export default class Request<T = any> {
	public socket: SocketIOExt.Socket;
	public packet: SocketIOExt.Packet;
	public data: T;

	constructor(data: T, socket: SocketIOExt.Socket, packet: SocketIOExt.Packet) {
		this.data = data;
		this.socket = socket;
		this.packet = packet;
	}

	public joinRoom(roomName: string) {
		this.socket.join(roomName);
		return this;
	}
}