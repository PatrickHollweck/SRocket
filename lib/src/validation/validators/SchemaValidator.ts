import * as Joi from "joi";

import { Validator } from "..";
import { ValidationResult } from "../ValidationResult";

export class SchemaValidator implements Validator {
	constructor(private schema: Joi.Schema) {}

	async executeOn(target: any) {
		const result = Joi.validate(target, this.schema);

		if (result.error) {
			return new ValidationResult(target, [result.error]);
		} else {
			return new ValidationResult(target);
		}
	}
}
