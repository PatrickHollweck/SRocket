export class Config {
	public port: number;
	public serverConfig: SocketIO.ServerOptions;

	constructor() {
		this.port = 8080;
		this.serverConfig = {};
	}
}
