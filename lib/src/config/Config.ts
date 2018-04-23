export class Config {
	public port: number;
	public serverConfig: SocketIO.ServerOptions;
	public seperationConvention: string;

	constructor() {
		this.port = 8080;
		this.serverConfig = {};
	}
}
