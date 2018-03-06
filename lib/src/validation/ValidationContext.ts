export class ValidationContext {
	public args: Array<any>;
	public property: string;
	public target: string;
	public value: string;

	constructor(args: Array<any>, property: string, target: any, value: any) {
		this.args = args;
		this.property = property;
		this.target = target;
		this.value = value;
	}
}