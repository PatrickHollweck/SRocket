import { Config } from "./Config";

export class ConfigBuilder {
	private config: Config;

	constructor(config?: Config) {
		this.config = config || new Config();
	}

	public setPort(port: number) {
		this.config.port = port;
		return this;
	}

	public setSocketIOServerConfig(config: SocketIO.ServerOptions) {
		this.config.serverConfig = config;
		return this;
	}

	public build() {
		return this.config;
	}
}
