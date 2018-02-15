import Rule from './Rules/Rule';
import WrongTypeError from 'src/errors/validation/WrongTypeError';

export type Rules = Array<Rule>;

export default class Validator {
	private static rules: Rules = new Array<Rule>();

	public static validateRules(target: any, rules: Rules) {
		// TODO: Rule arguments.
		for (const rule of rules) {
			if (!rule.run(target)) {
				throw new Error(rule.failureMessage);
			}
		}
	}

	public static validateRulesString(target: any, rulesString: string) {
		const rules = Validator.parse(rulesString);
		this.validateRules(target, rules);
	}

	public static checkType(target: any, type: any) {
		const packetArgType = target.constructor;
		const expectedArgType = type;

		if (packetArgType !== expectedArgType) {
			throw new WrongTypeError(`The prop ${target} has the type ${packetArgType} but should have type: ${expectedArgType}`, packetArgType, expectedArgType);
		}
	}

	public static parse(input: string): Rules {
		if(!input) {
			throw new Error('The rules-string must be defined!');
		}

		const tokens = input.split('|');
		const rules = new Array<Rule>();
		for (const token of tokens) {
			for (const rule of Validator.rules) {
				if (token === rule.name) {
					rules.push(rule);
				}
			}
		}

		return rules;
	}

	public static registerRule(rule: Rule) {
		Validator.rules.push(rule);
	}
}