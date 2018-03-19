import { TypedPair } from '../structures/Pair';
import { AbsentPropertyError } from '../errors/AbsentPropertyError';
import { Newable } from '../structures/Newable';

/**
 * Populdates a object with data from another object.
 *
 * @template T Type of the object that is being populated.
 * @param {Newable<any>} obj The object that should be populated.
 * @param {*} data The data the object should be populated with.
 * @param {Array<string>} objProperties The Properties of the Object that should be populated
 * @returns {(TypedPair<T, Error[]> | null)} A typedPair with errors if there where any and the populated object.
 */
export function	populateObject<T>(obj: Newable<any>, data: any, objProperties: Array<string> | null = null) : TypedPair<T, Error[]> {
	const errors = new Array<Error>();
	const instance = new obj();
	const actuallProperties = Object.getOwnPropertyNames(data);

	for (const property of objProperties || Object.getOwnPropertyNames(obj)) {
		if (!actuallProperties.includes(property)) {
			errors.push(new AbsentPropertyError(`Property ${property} is missing!`, property));
		}

		for (const actuallProperty of actuallProperties) {
			if (property === actuallProperty) {
				instance[property] = data[actuallProperty];
			}
		}
	}

	return new TypedPair(instance, errors);
}