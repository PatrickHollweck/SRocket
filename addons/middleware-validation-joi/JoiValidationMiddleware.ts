import "reflect-metadata";

import {
	Validator,
	SRequest,
	SResponse,
	ValidationResult,
	RouteMetadata,
	Middleware
} from "srocket";

import * as Joi from "joi";

export const joi = Joi;

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

export class JoiValidationMiddleware extends Middleware {
	async invoke(request: SRequest, response: SResponse, route: RouteMetadata, next: VoidFunction) {
		const metadata = Reflect.getMetadata(
			VALIDATION_METADATA_KEY,
			route.definition.controller,
			route.definition.property
		);

		const result = await new SchemaValidator(metadata).executeOn(request.data);

		if (result.didSucceed()) {
			next();
		}
	}
}

const VALIDATION_METADATA_KEY = Symbol("JoiValidationMetadataKey");
export function Validate(schema: Joi.Schema): PropertyDecorator {
	return (target: object, propertyKey: string | symbol) => {
		Reflect.defineMetadata(VALIDATION_METADATA_KEY, schema, target, propertyKey);
	};
}
