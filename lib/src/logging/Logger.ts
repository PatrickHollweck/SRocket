import { RuntimeConfiguration } from "../config/RuntimeConfiguration";
import { container } from "../di/SRocketContainer";

export enum LogLevel {
	Debug,
	Info,
	Warning,
	Error
}

export abstract class Logger {
	public readonly name: string;
	public readonly isEnabled: boolean;

	protected runtimeConfig: RuntimeConfiguration;

	constructor() {
		this.runtimeConfig = container.get(RuntimeConfiguration);
	}

	protected shouldLog(level: LogLevel) {
		return level >= this.runtimeConfig.logLevel;
	}

	abstract enable(): void;
	abstract disable(): void;

	abstract debug(message: string, e?: Error): void;
	abstract info(message: string, e?: Error): void;
	abstract warning(message: string, e?: Error): void;
	abstract error(message: string, e?: Error): void;
}
