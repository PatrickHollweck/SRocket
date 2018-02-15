import * as sio from 'socket.io';
import * as sioWildcard from 'socketio-wildcard';

import Router from 'src/router/Router';
import SRocketConfig from 'src/SRocketConfig';
import { initRules } from 'src/validation/rules/RuleBootstrapper';

export default class SRocket {

	public router: Router;

	protected io: SocketIOExt.Server;
	protected config: SRocketConfig;

	public constructor(config: SRocketConfig) {
		this.io = sio();
		this.config = config;
		this.router = new Router(this.io);

		initRules();
	}

	public listen(callback?: VoidFunction) {
		this.io.use(sioWildcard());

		this.io.on('connection', socket => {
			socket.on('*', packet => {
				this.router.route(packet, socket);
			});
		});

		this.io.listen(this.config.port);
		if(callback) {
			callback();
		}
	}

	public shutdown() {
		this.io.close();
	}

	public getConfig() {
		return this.config;
	}
}