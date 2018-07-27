import * as Joi from "joi";

import { SchemaValidator } from "../../src/validation/validators/SchemaValidator";

describe("The SchemaValidator", () => {
	const schema: Joi.Schema = Joi.object().keys({
		age: Joi.number(),
		username: Joi.string()
			.min(3)
			.max(99)
	});

	it("should fail when the data is invalid", async () => {
		const result = await new SchemaValidator(schema).executeOn({
			username: 12
		});

		expect(result.didFail()).toEqual(true);
	});

	it("should not fail when the data is valid", async () => {
		const result = await new SchemaValidator(schema).executeOn({
			username: "Patrick",
			age: 17
		});

		expect(result.didSucceed()).toEqual(true);
	});
});
