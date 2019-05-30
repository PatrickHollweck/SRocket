export function rightPad(input: string, amount: number, separator: string = " ") {
	while (input.length < amount) {
		input = `${input}${separator}`;
	}

	return input;
}

export function leftPad(input: string, amount: number, separator: string = " ") {
	while (input.length < amount) {
		input = `${separator}${input}`;
	}

	return input;
}
