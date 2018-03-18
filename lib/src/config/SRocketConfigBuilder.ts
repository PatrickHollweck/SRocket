import SRocketConfig from 'src/config/SRocketConfig';

export default class SRocketConfigBuilder {
	private config: SRocketConfig;

	constructor(config?: SRocketConfig) {
		this.config = config || new SRocketConfig();
	}

	public setPort(port: number) {
		this.config.port = port;
		return this;
	}

	public setSocketIOServerConfig(config: SocketIOExt.ServerOptions) {
		this.config.serverConfig = config;
		return this;
	}

	public build() {
		return this.config;
	}
}