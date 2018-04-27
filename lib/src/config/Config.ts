export class Config {
	public port: number;
	public serverConfig: SocketIO.ServerOptions;
	public seperationConvention: string;

	constructor() {
		this.port = 0;
		this.serverConfig = {};
	}
}
