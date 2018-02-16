import Rule from 'src/validation/Rules/Rule';

export default class SRocketConfig {
	public port: Number = 8080;
	public validationRules : Array<Rule>;

	constructor() {
		this.validationRules = new Array<Rule>();
	}
}