import * as sio from 'socket.io';
import Router from './router/Router';

export default class SRocket {

	public router:Router;
	private io: SocketIOExt.Server;

	public constructor(port: number) {
		this.io = sio();
		this.router = new Router();
	}

	public listen(callback: VoidFunction) {
		this.io.listen(1337);
		callback();
	}
}