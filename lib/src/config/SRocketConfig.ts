export default class SRocketConfig {
	public port: number;
	public serverConfig: SocketIO.ServerOptions;

	constructor() {
		this.port = 8080;
		this.serverConfig = {};
	}
}