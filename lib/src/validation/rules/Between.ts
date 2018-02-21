import Rule from './Rule';

export default class Between extends Rule {
	public name = 'Between';
	public failureMessage = 'The object was not was not in range!';

	public run(target: any, ...args) {
		if (args.length !== 2) throw new Error('The validation method "Between" requires exactly 2 Arguments!');
		return target >= args[0] && target <= args[1];
	}

	public getMessage(target: any, args: Array<any>) {
		return `The object was not in range of ${args[0]} to ${args[1]} !`;
	}
}