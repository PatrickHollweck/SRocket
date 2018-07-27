import { ValidationStatus } from "./ValidationStatus";

export class ValidationResult<T = any> {
	public errors: Error[];
	public status: ValidationStatus;

	constructor(public result: T | null, errors?: Error[], status?: ValidationStatus) {
		this.errors = errors || [];
		this.status = status || this.errors.length > 0 ? ValidationStatus.Failed : ValidationStatus.Succeeded;
	}

	public didFail(): boolean {
		return this.status === ValidationStatus.Failed;
	}

	public didSucceed(): boolean {
		return this.status === ValidationStatus.Succeeded;
	}

	public getFirstErrorMessage() {
		return this.errors[0].message || "";
	}

	public ifSucceeded(fn: VoidFunction) {
		if (this.didSucceed()) {
			fn();
		}
	}

	public ifFailed(fn: VoidFunction) {
		if (this.didFail()) {
			fn();
		}
	}
}
