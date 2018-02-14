export enum ValidationErrorType {
	MISSING_PROP,
	WRONG_TYPE,
}

// TODO: This can be extended to something like the laravel error system ? -> like generic errors with methods to get userfriendly messages...
export default class ValidationError extends Error {
	public type:ValidationErrorType;
	public message:string;

	public constructor(type:ValidationErrorType, message:string) {
		super(message);

		this.type = type;
		this.message = message;
	}
}