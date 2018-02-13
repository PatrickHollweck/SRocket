
export default class Request {
	public socket:SocketIOExt.Socket;
	public packet:SocketIOExt.Packet;

	constructor(socket:SocketIOExt.Socket, packet:SocketIOExt.Packet) {
		this.socket = socket;
		this.packet = packet;
	}

	public joinRoom(roomName:string) {
		this.socket.join(roomName);
		return this;
	}


}