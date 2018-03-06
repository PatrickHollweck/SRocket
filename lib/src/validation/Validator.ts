import * as _ from 'lodash';
import * as ClassValidator from 'class-validator';
import * as jsValidator from 'validator';

import { TypedPair } from 'src/structures/Pair';
import { ValidationError } from '../errors/ValidationError';
import { ValidationResult } from 'src/validation/ValidationResult';
import { ValidationContext } from 'src/validation/ValidationContext';
import { ValidationStatus } from 'src/validation/ValidationStatus';

export { ValidationResult, ValidationContext, ValidationError, ValidationStatus };

export const tsV = ClassValidator;
export const jsV = jsValidator;

// TODO: Rethink this whole validation thing... Maybe instance based ?
export class Validator {

	// TODO: Implement full set of validation function from class-validtor.
	public static validateClass(obj: any): Promise<ValidationResult> {
		return new Promise((resolve, reject) => {
			ClassValidator.validate(obj)
			.then(errors => {
				if(errors.length > 0) {
					return resolve(new ValidationResult(null, [ new ValidationError(this.getFirstErrorMessage(errors)) ]));
				} else {
					return resolve(new ValidationResult(obj));
				}
			});
		});
	}

	public static parseMessage(message: string, context: ValidationContext) {
		context.args.forEach((arg, index) => {
			message = message.replace(new RegExp(`\\$arg${index + 1}`, 'g'), arg);
		});

        return message
			.replace(/\$value/g, context.value)
			.replace(/\$property/g, context.property)
			.replace(/\$target/g, context.target);

	}

	public static checkType(target: any, type: any) {
		const targetType = target.constructor;
		const actuallType = type;

		return targetType === actuallType;
	}

	public static getFirstErrorMessage(errors: ClassValidator.ValidationError[]): string {
		const firstError = errors[0].constraints;
		const firstErrorKey = Object.keys(firstError)[0];
		const firstErrorMessage = errors[0].constraints[firstErrorKey];

		return firstErrorMessage;
	}
}