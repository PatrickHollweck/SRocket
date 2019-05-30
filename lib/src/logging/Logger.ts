export interface Logger {
	readonly name: string;
	readonly isEnabled: boolean;

	enable(): void;
	disable(): void;

	debug(message: string, e?: Error): void;
	info(message: string, e?: Error): void;
	warning(message: string, e?: Error): void;
	error(message: string, e?: Error): void;
}
