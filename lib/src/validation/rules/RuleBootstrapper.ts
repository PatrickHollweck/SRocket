import Validator from 'src/validation/Validator';
import Rule from './Rule';

import NotNull from './NotNull';

const rules : Array<Rule> = [
	new NotNull(),
];

export function initRules() {
	for(const rule of rules) {
		Validator.registerRule(rule);
	}
}