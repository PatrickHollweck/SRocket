import { Logger } from "./Logger";

export class ConsoleLogger implements Logger {
	private static baseName = "srocket:";

	public isEnabled: boolean = true;
	public name: string;

	private logger: any;

	constructor(name: string) {
		this.name = name;
		this.logger = require("debug")(ConsoleLogger.baseName + name);
	}

	enable() {
		this.logger.enable();
	}

	disable() {
		this.logger.disable();
	}

	debug(message: string, e?: Error | undefined): void {
		this.logger(this.format("debug", message, e));
	}

	info(message: string, e?: Error | undefined): void {
		this.logger(this.format("info", message, e));
	}

	warning(message: string, e?: Error | undefined): void {
		this.logger(this.format("warning", message, e));
	}

	error(message: string, e?: Error | undefined): void {
		this.logger(this.format("error", message, e));
	}

	private format(logLevel: string, message: string, e?: Error | undefined): string {
		let formattedMessage = `${logLevel.toUpperCase()} - ${message}`;
		if (e) {
			formattedMessage += ` : Error - ${e}`;
		}

		return formattedMessage;
	}
}
