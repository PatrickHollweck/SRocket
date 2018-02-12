import * as sio from 'socket.io';
import * as sioWildcard from 'socketio-wildcard';
import Router from './router/Router';

export default class SRocket {

	public router:Router;
	private io: SocketIOExt.Server;

	public constructor(port: number) {
		this.io = sio();
		this.router = new Router();
	}

	public listen(callback: VoidFunction) {
		this.io.use(sioWildcard());

		this.io.on('connection', socket => {
			socket.on('*', packet => {
				this.router.route(packet, socket);
			});
		});

		this.io.listen(1337);
		callback();
	}
}