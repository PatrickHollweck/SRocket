export class AbsentPropertyError extends Error {
	public missingProperty: string;

	constructor(message: string, missingProperty: string) {
		super(message);
		this.missingProperty = missingProperty;
	}
}