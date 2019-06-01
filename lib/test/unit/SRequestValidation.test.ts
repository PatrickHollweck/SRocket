import { SRequest, SEvent } from "../../src";
import { ValidationError } from "../../src/validation/ValidationError";

function setup(data: any) {
	return {
		request: new SRequest(data, "/", null!),
		data
	};
}

describe("SRequest Validation", () => {
	describe("validate()", () => {
		it("should validate if the schema matches", () => {
			const { request, data } = setup("test");
			const run = () => request.validate(SEvent.V.string);

			expect(run).not.toThrow();
			expect(run()).toEqual(data);
		});

		it("should throw if the schema does not match", () => {
			const { request } = setup("test");
			const run = () => request.validate(SEvent.V.number);

			expect(run).toThrowError(ValidationError);
		});

		it("should throw if it receives an array", () => {
			const { request } = setup([1, 2, 3, 4, 5]);
			const run = () => request.validate(SEvent.V.string);

			expect(run).toThrowError(ValidationError);
		});
	});

	describe("validateMany()", () => {
		it("should validate if the schema matches", () => {
			const { request, data } = setup(["test", 1]);
			const run = () =>
				request.validateMany({
					name: SEvent.V.string,
					age: SEvent.V.number
				});

			expect(run).not.toThrowError();

			expect(run()).toEqual({
				name: "test",
				age: 1
			});
		});

		it("should throw if the schema does not match", () => {
			const { request } = setup(["test", 1]);
			const run = () =>
				request.validateMany({
					id: SEvent.V.number,
					age: SEvent.V.number
				});

			expect(run).toThrowError(ValidationError);
		});

		it("should throw if the input is not an array", () => {
			const { request } = setup("test");
			const run = () =>
				request.validateMany({
					id: SEvent.V.number,
					age: SEvent.V.number
				});

			expect(run).toThrowError(ValidationError);
		});

		it("should throw if the array is out of bounds", () => {
			const { request } = setup(["test", 1]);
			const run = () =>
				request.validateMany({
					id: SEvent.V.number,
					age: SEvent.V.number,
					date: SEvent.V.number
				});

			expect(run).toThrowError(ValidationError);
		});

		it("should exclude the ack from the the data", () => {
			const { request } = setup([
				"test",
				() => {
					/* */
				}
			]);

			const run = () =>
				request.validateMany({
					name: SEvent.V.string,
					// You should not be able to extrackt the ack
					someFn: SEvent.V.Function
				});

			expect(run).toThrow(ValidationError);
		});
	});
});
