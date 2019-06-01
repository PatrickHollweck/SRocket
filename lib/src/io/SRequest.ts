import * as t from "io-ts";
import { ValidationError } from "../validation/ValidationError";
import { extractAck } from "../utility/Types";

export class SRequest<T = any> {
	public readonly socket: SocketIO.Socket;
	public readonly rawData: T;

	public readonly hasAck: boolean;
	public readonly ack: VoidFunction;

	public readonly path: string;

	/**
	 * The IO-TS validation library
	 * Use this member as a shorthand to access it,
	 * Used to define the schema for the `SRequest.validation` functions
	 *
	 * docs: https://github.com/gcanti/io-ts
	 *
	 * @memberof SRequest
	 */
	public readonly v = t;

	/**
	 * The IO-TS validation library
	 * Use this member as a shorthand to access it,
	 * Used to define the schema for the `SRequest.validation` functions
	 *
	 * docs: https://github.com/gcanti/io-ts
	 *
	 * @static
	 * @memberof SRequest
	 */
	public static readonly V = t;

	constructor(data: T, path: string, socket: SocketIO.Socket) {
		this.path = path;
		this.rawData = data;
		this.socket = socket;

		const info = extractAck(data);
		this.hasAck = info.hasAck;
		this.ack = info.ack;
	}

	// tslint:disable:jsdoc-format

	/**
	 * Validates the request data when you only expect a single input, and maybe an ack.
	 *
	 * If you emit like this:
	 * `socket.emit(<eventName>, { name: "John", age: 74 }, () => {})`
	 *
	 * The data will look like this:
	 * Acks get removed before validation.
	 * `[{name:"John", age: 74}]`
	 *
	 * Typical validator usage would be:
	 * ```
	 * const data = request.validate(t.type({
	 * 	name: t.string,
	 *  age: t.number
	 * }));
	 * ```
	 *
	 * Which would leave the data of type:
	 * `{ name: string, age: number}`
	 *
	 * --------------------------------
	 *
	 * This function uses `io-ts` as its validation / schema library.
	 * You read the docs here: https://github.com/gcanti/io-ts
	 *
	 * This function throw if validation fails.
	 * Validation Errors can be caught by the global error handler
	 */
	validate<I extends t.Decoder<any, any> & t.Any>(schema: I): t.TypeOf<I> {
		const data = this.getDataWithoutAck();
		const result = schema.decode(data);

		if (result.isLeft()) {
			throw new ValidationError("Schema does not match: " + result.value, data);
		} else {
			return result.value;
		}
	}

	/**
	 * Validates the request data when you expect more than one input.
	 *
	 * For example you may emit like this:
	 * `socket.emit(<eventName>, "John", 84, true, console.log)`
	 * Which results in the following data (acks get automatically removed):
	 * `["John", 84, true]`
	 * To handle a scenario like this, this method exists.
	 *
	 * The typical usage would be like this:
	 * ```
	 * const data = request.validate({
	 *	name: event.v.string,
	 *  age: event.v.number,
	 *  isPremium: event.v.boolean
	 * })
	 * ```
	 *
	 * You will then get a objec back which contains the keys, you specified with
	 * the data-type you specified.
	 *
	 * The arguments will be mapped sequentially, Meaning:
	 * `name` will be mapped to the 1. Parameter of the `request.rawData`
	 * `age` will be mapped to the 2. Parameter of the `request.rawData`
	 * ...
	 *
	 * The type of the object your get back will be:
	 * `{ name: string, age: number, isPremium: boolean }`
	 *
	 * This function uses `io-ts` as its validation / schema library.
	 * You read the docs here: https://github.com/gcanti/io-ts
	 *
	 * --------------------------------
	 *
	 * This function throws when validation fails!
	 * Validation Errors can be caught by the global error handler
	 */
	validateMany<I extends { [key: string]: t.Decoder<any, any> & t.Any }>(
		objectSchema: I
	): { [K in keyof I]: t.TypeOf<I[K]> } {
		const converted = {} as I;
		let index = 0;

		if (!Array.isArray(this.rawData)) {
			throw new ValidationError("Array extected as input!", this.rawData);
		}

		const data = this.getDataWithoutAck() as any;

		// tslint:disable-next-line:forin
		for (const key in objectSchema) {
			const result = objectSchema[key].decode(data[index]);

			if (!result.isRight()) {
				throw new ValidationError(result.value.join(" "), this.rawData, key);
			} else {
				converted[key] = result.value;
				index++;
			}
		}

		return converted;
	}

	// tslint:enable:jsdoc-format

	private getDataWithoutAck() {
		if (Array.isArray(this.rawData)) {
			if (this.hasAck) {
				this.rawData.reverse().shift();
				return this.rawData.reverse();
			}
		}

		return this.rawData;
	}
}
