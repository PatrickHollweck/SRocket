export default abstract class Rule {
	public abstract name: string;
	public abstract failureMessage: string;

	public run(target:any, ...args) : boolean {
		return false;
	}
}