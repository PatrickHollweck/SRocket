import { TypedPair } from '../structures/Pair';

export class CallbackCollection {
	protected collections: Array<TypedPair<string, Array<Function>>>;

	constructor() {
		this.collections = new Array<TypedPair<string, Array<Function>>>();
	}

	public registerCollection(name: string) {
		this.collections.push(new TypedPair(name, new Array<Function>()));
	}

	public registerCollections(...names: Array<Array<string>>) {
		for (const nameCollection of names) {
			for (const name of nameCollection) {
				this.registerCollection(name);
			}
		}
	}

	public addCallback(name: string, fn: Function) {
		const collection = this.getCollection(name);
		collection.value.push(fn);
	}

	public executeFor(name: string, ...args) {
		const collection = this.getCollection(name);
		for (const fn of collection.value) {
			fn(args);
		}
	}

	private getCollection(name: string) {
		const collection = this.collections.find(col => col.key === name);
		if (!collection) throw new Error(`The callback collection ${name} is not registered!`);
		return collection;
	}
}