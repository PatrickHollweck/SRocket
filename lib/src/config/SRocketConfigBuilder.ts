import SRocketConfig from 'src/config/SRocketConfig';

export default class SRocketConfigBuilder {
	private config: SRocketConfig;

	constructor(config?: SRocketConfig) {
		this.config = config || new SRocketConfig();
	}

	public setPort(port: Number) {
		this.config.port = port;
		return this;
	}

	public build() {
		return this.config;
	}
}