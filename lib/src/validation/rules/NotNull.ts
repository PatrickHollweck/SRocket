import Rule from './Rule';

export default class NotNull extends Rule {
	public name = 'NotNull';
	public failureMessage = 'The object was not null!';

	public run(target:any) {
		return target !== null && target !== undefined;
	}
}