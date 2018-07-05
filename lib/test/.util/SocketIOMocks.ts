import { EventEmitter } from "events";

export class SocketIONamespaceMock extends EventEmitter implements SocketIO.Namespace {
	name: string;
	server: SocketIO.Server;
	sockets: { [id: string]: SocketIO.Socket };
	connected: { [id: string]: SocketIO.Socket };
	adapter: SocketIO.Adapter;
	json: SocketIO.Namespace;

	use(fn: (socket: SocketIO.Socket, fn: (err?: any) => void) => void): SocketIO.Namespace {
		return this;
	}

	to(room: string): SocketIO.Namespace {
		return this;
	}

	in(room: string): SocketIO.Namespace {
		return this;
	}

	send(...args: any[]): SocketIO.Namespace {
		return this;
	}

	write(...args: any[]): SocketIO.Namespace {
		return this;
	}

	on(event: "connection" | "connect", listener: (socket: SocketIO.Socket) => void): this;
	on(event: string, listener: Function): this;
	on(event: any, listener: any) {
		return this;
	}

	clients(fn: Function): SocketIO.Namespace {
		return this;
	}

	compress(compress: boolean): SocketIO.Namespace {
		return this;
	}

	addListener(event: string | symbol, listener: (...args: any[]) => void): this {
		throw this;
	}

	once(event: string | symbol, listener: (...args: any[]) => void): this {
		throw this;
	}

	removeListener(event: string | symbol, listener: (...args: any[]) => void): this {
		throw this;
	}

	off(event: string | symbol, listener: (...args: any[]) => void): this {
		throw this;
	}

	removeAllListeners(event?: string | symbol | undefined): this {
		throw this;
	}

	setMaxListeners(n: number): this {
		throw this;
	}

	getMaxListeners(): number {
		throw this;
	}

	listeners(event: string | symbol): Function[] {
		throw new Error("Method not implemented.");
	}

	rawListeners(event: string | symbol): Function[] {
		throw new Error("Method not implemented.");
	}

	emit(event: string | symbol, ...args: any[]): boolean {
		throw new Error("Method not implemented.");
	}

	listenerCount(type: string | symbol): number {
		throw new Error("Method not implemented.");
	}

	prependListener(event: string | symbol, listener: (...args: any[]) => void): this {
		throw new Error("Method not implemented.");
	}

	prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this {
		throw new Error("Method not implemented.");
	}

	eventNames(): (string | symbol)[] {
		throw new Error("Method not implemented.");
	}
}

export class SocketIOServerMock implements SocketIO.Server {
	engine: { ws: any };
	nsps: { [namespace: string]: SocketIO.Namespace };
	sockets: SocketIO.Namespace;
	json: SocketIO.Server;
	volatile: SocketIO.Server;
	local: SocketIO.Server;

	checkRequest(req: any, fn: (err: any, success: boolean) => void): void {}

	serveClient(): boolean;
	serveClient(v: boolean): SocketIO.Server;
	serveClient(v?: any) {
		return new SocketIOServerMock();
	}

	path(): string;
	path(v: string): SocketIO.Server;
	path(v?: any) {
		return new SocketIOServerMock();
	}

	adapter();
	adapter(v: any): SocketIO.Server;
	adapter(v?: any) {
		return new SocketIOServerMock();
	}

	origins(): string | string[];
	origins(v: string | string[]): SocketIO.Server;
	origins(v?: any) {
		return new SocketIOServerMock();
	}

	attach(srv: any, opts?: SocketIO.ServerOptions | undefined): SocketIO.Server;
	attach(port: any, opts?: any) {
		return new SocketIOServerMock();
	}

	listen(srv: any, opts?: SocketIO.ServerOptions | undefined): SocketIO.Server;
	listen(port: any, opts?: any) {
		return new SocketIOServerMock();
	}

	bind(srv: any): SocketIO.Server {
		return new SocketIOServerMock();
	}

	onconnection(socket: any): SocketIO.Server {
		return new SocketIOServerMock();
	}

	of(nsp: string): SocketIO.Namespace {
		return new SocketIONamespaceMock();
	}

	close(fn?: (() => void) | undefined): void {}

	on(event: "connect" | "connection", listener: (socket: SocketIO.Socket) => void): SocketIO.Namespace;
	on(event: string, listener: Function): SocketIO.Namespace;
	on(event: any, listener: any) {
		return this;
	}

	to(room: string): SocketIO.Namespace {
		return new SocketIONamespaceMock();
	}

	in(room: string): SocketIO.Namespace {
		return new SocketIONamespaceMock();
	}

	use(fn: (socket: SocketIO.Socket, fn: (err?: any) => void) => void): SocketIO.Namespace {
		return new SocketIONamespaceMock();
	}

	emit(event: string, ...args: any[]): SocketIO.Namespace {
		return new SocketIONamespaceMock();
	}

	send(...args: any[]): SocketIO.Namespace {
		return new SocketIONamespaceMock();
	}

	write(...args: any[]): SocketIO.Namespace {
		return new SocketIONamespaceMock();
	}

	clients(...args: any[]): SocketIO.Namespace {
		return new SocketIONamespaceMock();
	}

	compress(...args: any[]): SocketIO.Namespace {
		return new SocketIONamespaceMock();
	}
}
