import { Logger, LogLevel } from "./Logger";

export class ConsoleLogger extends Logger {
	private static readonly baseName = "srocket:";

	public isEnabled = true;
	public name: string;

	private readonly logger: any;

	public constructor(name: string) {
		super(name);

		this.name = name;
		// tslint:disable-next-line:no-require-imports
		this.logger = require("debug")(ConsoleLogger.baseName + name);
	}

	public enable(): void {
		this.logger.enable();
	}

	public disable(): void {
		this.logger.disable();
	}

	public debug(message: string, e?: Error | undefined): void {
		if (this.shouldLog(LogLevel.Debug)) {
			this.logger(this.format("debug", message, e));
		}
	}

	public info(message: string, e?: Error | undefined): void {
		if (this.shouldLog(LogLevel.Info)) {
			this.logger(this.format("info", message, e));
		}
	}

	public warning(message: string, e?: Error | undefined): void {
		if (this.shouldLog(LogLevel.Warning)) {
			this.logger(this.format("warning", message, e));
		}
	}

	public error(message: string, e?: Error | undefined): void {
		if (this.shouldLog(LogLevel.Error)) {
			this.logger(this.format("error", message, e));
		}
	}

	private format(logLevel: string, message: string, e?: Error | undefined): string {
		let formattedMessage = `${logLevel.toUpperCase()} - ${message}`;
		if (e) {
			formattedMessage += ` : Error - ${e}`;
		}

		return formattedMessage;
	}
}
