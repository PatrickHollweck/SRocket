import Validator from 'src/validation/Validator';
import Rule from './Rule';

import NotNull from './NotNull';
import Between from './Between';

const rules : Array<Rule> = [
	new NotNull(),
	new Between(),
];

export function initRules() {
	for(const rule of rules) {
		Validator.registerRule(rule);
	}
}