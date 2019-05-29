export class SRequest<T = any> {
	public readonly socket: SocketIO.Socket;
	public readonly path: string;
	public readonly data: T;

	constructor(data: T, path: string, socket: SocketIO.Socket) {
		this.path = path;
		this.data = data;
		this.socket = socket;
	}
}
