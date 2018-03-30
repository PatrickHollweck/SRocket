import { ValidationStatus } from "./ValidationStatus";

export class ValidationResult<T = any> {
	public target: T | null;
	public errors: Array<Error>;
	public status: ValidationStatus;

	constructor(
		result: T | null,
		errors: Array<Error> = new Array<Error>(),
		status: ValidationStatus = ValidationStatus.Failed
	) {
		this.target = result;
		this.errors = errors;
		this.status =
			status || this.errors.length > 0
				? ValidationStatus.Failed
				: ValidationStatus.Succeeded;
	}

	public didFail(): boolean {
		return this.status === ValidationStatus.Failed;
	}

	public didSucceed(): boolean {
		return this.status === ValidationStatus.Succeeded;
	}

	// TODO: Method for easy interaction with result -> doIfSuccess()...
}
