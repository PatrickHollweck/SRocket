import { expect } from "chai";

import { Validator, ValidationContext, jsV } from "../src/validation";
import { RuleSchema } from "../src/validation/Validator";

describe("The Validator", () => {
	describe("Message parsing", () => {
		it("should replace the predefined tokens correctly", () => {
			const context = new ValidationContext(["--arg1--", "--arg2--", "--arg3--"], "--property--", "--target--", "--value--");
			const originalMessage = "The $property should equal $arg1 or $arg2 - as target $target - but has $value";
			const parsedMessage = Validator.parseMessage(originalMessage, context);

			expect(parsedMessage).to.be.a("String");

			expect(parsedMessage)
				.to.contain(context.property)
				.and.not.contain("$property");

			expect(parsedMessage)
				.to.contain(context.args[0])
				.and.not.contain("$arg1");

			expect(parsedMessage)
				.to.contain(context.target)
				.and.not.contain("$target");

			expect(parsedMessage)
				.to.contain(context.value)
				.and.not.contain("$value");
		});
	});

	describe("Type-Checking", () => {
		it("should return true when the correct type is given", () => {
			expect(Validator.checkType("string", String)).to.equal(true);
		});

		it("should return false when the wrong type is given", () => {
			expect(Validator.checkType(12345, String)).to.equal(false);
		});
	});

	describe("RuleSchema validation", () => {
		const userSchema: RuleSchema = {
			userName: {
				type: String,
				rules: [
					{
						method: jsV.contains,
						args: ["hello World"],
						message: "The $property did not contain $arg1!"
					}
				]
			}
		};
		
		it("should fail when given no data", () => {
			const result = Validator.validateSchema(userSchema, null);
			expect(result.didFail()).to.equal(true);
		});

		it("should fail when a wrong type is given", () => {
			const result = Validator.validateSchema(userSchema, { userName: 123 });
			expect(result.didFail()).to.equal(true);
		});

		it("should execute all specified rules", () => {
			const result = Validator.validateSchema(userSchema, { userName: "Some stuff" });
			expect(result.didFail()).to.equal(true);
		});

		it("should parse the schemas message", () => {
			const result = Validator.validateSchema(userSchema, { userName: "Some stuff" });
			expect(result.getFirstErrorMessage()).to.equal("The userName did not contain hello World!");
		});
	});
});
