import * as _ from 'lodash';
import * as ClassValidator from 'class-validator';

import { TypedPair } from 'src/structures/Pair';
import { ValidationError } from '../errors/ValidationError';

export enum ValidationStatus {
	Failed,
	Succeeded,
}

export class ValidationResult<T = any> {
	public target: T | null;
	public errors: Array<Error>;
	public status: ValidationStatus;

	constructor(result: T | null, errors: Array<Error> = new Array<Error>(), status: ValidationStatus = ValidationStatus.Failed) {
		this.target = result;
		this.errors = errors;
		this.status = status || this.errors.length > 0 ? ValidationStatus.Failed : ValidationStatus.Succeeded;
	}

	public didFail() : boolean {
		return this.status === ValidationStatus.Failed;
	}

	public didSucceed() : boolean {
		return this.status === ValidationStatus.Succeeded;
	}

	// TODO: Method for easy interaction with result -> doIfSuccess()...
}

export class ValidationContext {
	public args: Array<any>;
	public property: string;
	public target: string;
	public value: string;

	constructor(args: Array<any>, property: string, target: any, value: any) {
		this.args = args;
		this.property = property;
		this.target = target;
		this.value = value;
	}
}

// TODO: Rethink this whole validation thing... Maybe instance based ?
export default class Validator {

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
		if (message && context.args instanceof Array) {
            context.args.forEach((constraint, index) => {
                message = message.replace(new RegExp(`\\$constraint${index + 1}`, 'g'), constraint);
            });
        }

        if (message && context.value !== undefined && context.value !== null)
            message = message.replace(/\$value/g, context.value);
        if (message)
            message = message.replace(/\$property/g, context.property);
        if (message)
            message = message.replace(/\$target/g, context.target);

        return message;
	}

	public static checkType(target: any, type: any) {
		const targetType = target.constructor;
		const acutallType = type;

		return targetType === acutallType;
	}

	public static getFirstErrorMessage(errors: ClassValidator.ValidationError[]): string {
		const firstError = errors[0].constraints;
		const firstErrorKey = Object.keys(firstError)[0];
		const firstErrorMessage = errors[0].constraints[firstErrorKey];

		return firstErrorMessage;
	}
}