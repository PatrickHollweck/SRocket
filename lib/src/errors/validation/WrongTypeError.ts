export default class WrongTypeError extends Error {
	public givenType: string;
	public expectedType: string;

	constructor(message: string, givenType: string, expectedType: string) {
		super(message);
		this.givenType = givenType;
		this.expectedType = expectedType;
	}
}