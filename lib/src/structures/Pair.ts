export class TypedPair<K, V> {
	public key: K;
	public value: V;

	public constructor(key: K, value: V) {
		this.key = key;
		this.value = value;
	}
}