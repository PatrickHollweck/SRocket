export default abstract class Rule {
	public abstract name: string;

	abstract getMessage(target: any, ...args: Array<any>): string;
	abstract run(target: any, ...args: Array<any>): boolean;
}