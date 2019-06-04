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

	public constructor() {
		this.runtimeConfig = container.get(RuntimeConfiguration);
	}

	protected shouldLog(level: LogLevel) {
		return level >= this.runtimeConfig.logLevel;
	}

	public abstract enable(): void;
	public abstract disable(): void;

	public abstract debug(message: string, e?: Error): void;
	public abstract info(message: string, e?: Error): void;
	public abstract warning(message: string, e?: Error): void;
	public abstract error(message: string, e?: Error): void;
}
