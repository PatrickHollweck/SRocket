import Rule from './Rule';

export default class NotNull extends Rule {
	public name = 'NotNull';

	public run(target: any) {
		return target !== null && target !== undefined;
	}

	public getMessage(target) {
		return `${target} must not be null!`;
	}
}