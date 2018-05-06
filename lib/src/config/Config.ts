export class Config {
	public port: number;
	public serverConfig: SocketIO.ServerOptions;
	public separationConvention: string;

	constructor() {
		this.port = 0;
		this.serverConfig = {};
	}
}
