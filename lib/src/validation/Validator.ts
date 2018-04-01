import * as ClassValidator from "class-validator";
import * as jsValidator from "validator";

import { AbsentPropertyError, ValidationError } from "../errors";
import { ValidationResult } from "./ValidationResult";
import { ValidationContext } from "./ValidationContext";
import { ValidationStatus } from "./ValidationStatus";

export { ValidationResult, ValidationContext, ValidationError, ValidationStatus };

export const tsV = ClassValidator;
export const jsV = jsValidator;

export type Rule = {
	method: Function;
	args?: Array<any>;
	message?: string;
};

export type RuleSchema = {
	[key: string]: {
		type: any;
		rules?: Array<Rule>;
	};
};

export class Validator {
	// TODO: Implement full set of validation function from class-validator.
	public static validateClass(obj: any): Promise<ValidationResult> {
		return new Promise((resolve, reject) => {
			ClassValidator.validate(obj).then(errors => {
				if (errors.length > 0) {
					return resolve(new ValidationResult(null, [new ValidationError(this.getFirstErrorMessage(errors))]));
				} else {
					return resolve(new ValidationResult(obj));
				}
			});
		});
	}

	public static validateSchema(schema: RuleSchema, actualData: any): ValidationResult {
		if (!actualData) {
			return new ValidationResult(null, [new AbsentPropertyError("All properties are missing!", "*")]);
		}

		const validationErrors = new Array<Error>();
		for (const expectedProperty of Object.getOwnPropertyNames(schema)) {
			const currentExpectedValue = schema[expectedProperty];
			const currentActualValue = actualData[expectedProperty];

			if (currentActualValue == undefined) {
				validationErrors.push(new AbsentPropertyError(`Property ${expectedProperty} is missing!`, expectedProperty));
				continue;
			}

			if (!Validator.checkType(currentActualValue, currentExpectedValue.type)) {
				validationErrors.push(
					new TypeError(
						`Property ${expectedProperty} has type ${currentActualValue.constructor} but should have type ${currentExpectedValue.type}`
					)
				);

				continue;
			}

			if (currentExpectedValue.rules) {
				for (const rule of currentExpectedValue.rules) {
					if (!rule.method(currentActualValue, rule.args)) {
						validationErrors.push(
							new ValidationError(
								Validator.getMessage(rule, new ValidationContext(rule.args || [], expectedProperty, actualData, currentActualValue))
							)
						);
					}
				}
			}
		}

		return new ValidationResult(actualData, validationErrors);
	}

	public static getMessage(rule: Rule, context: ValidationContext) {
		if (rule.message) {
			return Validator.parseMessage(rule.message, context);
		} else {
			return `Validator Rule: "${rule.method}" with args: "${rule.args}" failed!`;
		}
	}

	public static parseMessage(message: string, context: ValidationContext) {
		context.args.forEach((arg, index) => {
			message = message.replace(new RegExp(`\\$arg${index + 1}`, "g"), arg);
		});

		return message
			.replace(/\$value/g, context.value)
			.replace(/\$property/g, context.property)
			.replace(/\$target/g, context.target);
	}

	public static checkType(givenObject: any, expected: any) {
		const targetType = givenObject.constructor;
		const actuallType = expected;

		return targetType === actuallType;
	}

	public static getFirstErrorMessage(errors: ClassValidator.ValidationError[]): string {
		const firstError = errors[0].constraints;
		const firstErrorKey = Object.keys(firstError)[0];
		const firstErrorMessage = errors[0].constraints[firstErrorKey];

		return firstErrorMessage;
	}
}
