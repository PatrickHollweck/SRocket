import Validator from 'src/validation/Validator';
import Rule from './Rule';

import NotNull from './NotNull';
import Between from './Between';

export const defaultRules: Array<Rule> = [
	new NotNull(),
	new Between(),
];