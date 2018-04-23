import { Validator, ValidationContext, jsV } from "../src/validation";
import { RuleSchema } from "../src/validation/Validator";

describe("The Validator", () => {
	describe("Message parsing", () => {
		it("should replace the predefined tokens correctly", () => {
			const context = new ValidationContext(["--arg1--", "--arg2--", "--arg3--"], "--property--", "--target--", "--value--");
			const originalMessage = "The $property should equal $arg1 or $arg2 - as target $target - but has $value";
			const parsedMessage = Validator.parseMessage(originalMessage, context);

			expect(parsedMessage).toContain(context.property);
			expect(parsedMessage).toContain(context.args[0]);
			expect(parsedMessage).toContain(context.target);
			expect(parsedMessage).toContain(context.value);
		});
	});

	describe("Type-Checking", () => {
		it("should return true when the correct type is given", () => {
			expect(Validator.checkType("string", String)).toEqual(true);
		});

		it("should return false when the wrong type is given", () => {
			expect(Validator.checkType(12345, String)).toEqual(false);
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
			expect(result.didFail()).toEqual(true);
		});

		it("should fail when a wrong type is given", () => {
			const result = Validator.validateSchema(userSchema, { userName: 123 });
			expect(result.didFail()).toEqual(true);
		});

		it("should execute all specified rules", () => {
			const result = Validator.validateSchema(userSchema, { userName: "Some stuff" });
			expect(result.didFail()).toEqual(true);
		});

		it("should parse the schemas message", () => {
			const result = Validator.validateSchema(userSchema, { userName: "Some stuff" });
			expect(result.getFirstErrorMessage()).toEqual("The userName did not contain hello World!");
		});
	});
});
