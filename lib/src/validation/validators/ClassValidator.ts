import * as ClassValidatorLib from "class-validator";

import { Validator } from "./Validator";
import { ValidationError } from "../../errors/ValidationError";
import { ValidationResult } from "../ValidationResult";

export const tsV = ClassValidatorLib;

export class ClassValidator implements Validator {
	async executeOn(target: any) {
		const result = await ClassValidatorLib.validate(target);

		if (result.length !== 0) {
			return new ValidationResult(target, [
				new ValidationError(ClassValidator.getFirstErrorMessage(result))
			]);
		} else {
			return new ValidationResult(target);
		}
	}

	private static getFirstErrorMessage(errors: ClassValidatorLib.ValidationError[]): string {
		const firstError = errors[0].constraints;
		const firstErrorKey = Object.keys(firstError)[0];
		const firstErrorMessage = errors[0].constraints[firstErrorKey];

		return firstErrorMessage;
	}
}
