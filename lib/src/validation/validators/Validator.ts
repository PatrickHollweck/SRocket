import { ValidationResult } from "../ValidationResult";

export interface Validator {
	executeOn(target: any): Promise<ValidationResult<typeof target>>;
}
