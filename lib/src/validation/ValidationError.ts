export class ValidationError extends Error {
	public readonly property?: string;
	public readonly target: any;

	constructor(message: string, target: any, property?: string) {
		super(message);

		this.property = property;
		this.target = target;
	}
}
