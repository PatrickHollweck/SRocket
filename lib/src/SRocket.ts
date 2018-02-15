import * as sio from 'socket.io';
import * as sioWildcard from 'socketio-wildcard';

import Router from 'src/router/Router';

export default class SRocket {

	public router: Router;
	private io: SocketIOExt.Server;
	private port: Number;

	public constructor(port: number) {
		this.io = sio();
		this.port = port;
		this.router = new Router(this.io);
	}

	public listen(callback?: VoidFunction) {
		this.io.use(sioWildcard());

		this.io.on('connection', socket => {
			socket.on('*', packet => {
				this.router.route(packet, socket);
			});
		});

		this.io.listen(this.port);
		if(callback) {
			callback();
		}
	}

	public shutdown() {
		this.io.close();
	}
}