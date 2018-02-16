import SRocketConfig from 'src/SRocketConfig';
import Rule from 'src/validation/Rules/Rule';

export default class SRocketConfigBuilder {
	private config: SRocketConfig;

	constructor(config?: SRocketConfig) {
		this.config = config || new SRocketConfig();
	}

	public setPort(port: Number) {
		this.config.port = port;
		return this;
	}

	public registerValidationRule(rule: Rule) {
		this.config.validationRules.push(rule);
	}

	public registerValidationRules(rules: Array<Rule>) {
		for(const rule of rules) {
			this.registerValidationRule(rule);
		}
	}

	public build() {
		return this.config;
	}
}