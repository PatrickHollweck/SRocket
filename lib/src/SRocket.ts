import * as sio from 'socket.io';
import * as sioWildcard from 'socketio-wildcard';

import { defaultRules } from './validation/rules/RuleBootstrapper';

import Router from 'src/router/Router';
import Validator from './validation/Validator';
import SRocketConfig from 'src/SRocketConfig';

export default class SRocket {

	public router: Router;

	protected io: SocketIOExt.Server;
	protected config: SRocketConfig;

	public constructor(config: SRocketConfig) {
		this.io = sio();
		this.config = config;
		this.router = new Router(this.io);

		Validator.registerRules(defaultRules, config.validationRules);
	}

	public listen(callback?: Function) {
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