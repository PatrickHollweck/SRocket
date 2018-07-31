import { tsV, ClassValidator } from "../../src/validation/validators/ClassValidator";

class UserModel {
	@tsV.IsDefined()
	@tsV.IsString()
	username: string;

	@tsV.IsDefined()
	@tsV.IsNumber()
	age: number;
}

describe("The ClassValidator", () => {
	it("should fail when the data is invalid", async () => {
		const user = new UserModel();
		user.username = "Patrick";

		const result = await new ClassValidator().executeOn(user);

		expect(result.didFail()).toEqual(true);
	});

	it("should not fail when the data is valid", async () => {
		const user = new UserModel();
		user.username = "Patrick";
		user.age = 17;

		const result = await new ClassValidator().executeOn(user);

		expect(result.didSucceed()).toEqual(true);
	});
});
