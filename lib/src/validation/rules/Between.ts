import Rule from './Rule';

export default class NotNull extends Rule {
	public name = 'Between';
	public failureMessage = 'The object was not was not in range!';

	public run(target:any, ...args) {
		if(args.length !== 2) throw new Error('The validation method "Between" requires exactly 2 Arguments!');
		return target >= args[0] && target <= args[1];
	}
}