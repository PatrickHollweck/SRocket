import * as _ from 'lodash';

import { TypedPair } from 'src/structures/Pair';

import Rule from './Rules/Rule';
import WrongTypeError from 'src/errors/validation/WrongTypeError';

export type Rules = Array<Rule>;
export type RulesWithArgs = Array<TypedPair<Rule, Array<any>>>;

export default class Validator {
	private static rules: Rules = new Array<Rule>();

	public static validateRules(target: any, rules: RulesWithArgs) {
		for (const rule of rules) {
			if (!rule.key.run(target, ...rule.value)) {
				throw new Error(rule.key.getMessage(target, ...rule.value));
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

	public static registerRule(rule: Rule) {
		Validator.rules.push(rule);
	}

	public static registerRules(...rules: Array<Array<Rule>>) {
		if (_.isNil(rules)) throw new Error('Tried to register invalid Validation-Rules! The rules where undefined or null!');

		for (const ruleSet of rules) {
			for (const rule of ruleSet) {
				this.registerRule(rule);
			}
		}
	}

	private static parse(input: string): RulesWithArgs {
		if (!input) {
			throw new Error('The rules-string must be defined!');
		}

		const ruleTokens = input.split('|');

		const rules = new Array<TypedPair<Rule, Array<any>>>();
		for (const token of ruleTokens) {
			for (const rule of Validator.rules) {
				const tokenArgs = token.split(':');
				if (tokenArgs[0] === rule.name) {
					const args = tokenArgs.filter(arg => {
						return arg !== rule.name;
					});

					rules.push(new TypedPair(rule, args));
				}
			}
		}

		return rules;
	}
}