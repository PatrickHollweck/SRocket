// tslint:disable-next-line:no-reference
/// <reference path="./typings/types.d.ts" />

import * as sio from "socket.io";
import * as sioWildcard from "socketio-wildcard";

import { Router, RouterCallbackType } from "./router";
import { getModuleConfigDecorator } from "./decorator/ModuleConfig";
import { MiddlewareBase } from "./middleware";
import { container } from "./di/SRocketContainer";
import { Container } from "inversify";
import { Module } from "./modules";
import { Config } from "./config";

export class SRocket {
	public config: Config;
	public ioServer: SocketIO.Server;

	protected router: Router;

	private constructor(port: number) {
		this.config = new Config();
		this.config.port = port;
		// TODO: Add ability to access config back
		this.ioServer = sio.listen(port);
		this.router = new Router(this.ioServer);

		container.bind(SRocket).toConstantValue(this);
		container.bind(Config).toConstantValue(this.config);
	}

	public static make(port: number) {
		return new SRocket(port);
	}

	public configureContainer(fn: (container: Container) => void) {
		fn(container);
		return this;
	}

	public separationConvention(convention: string) {
		this.config.seperationConvention = convention;
		return this;
	}

	public modules(...modules: Module[]) {
		for (const module of modules) {
			const metadata = getModuleConfigDecorator(module);
			if (!metadata) throw new Error(`Could not get decorator for module named: ${module}`);

			this.router.routeContainer.controller(metadata, metadata.controllers[0]);
		}

		return this;
	}

	public listen(callback?: (app: SRocket) => void) {
		this.ioServer.use(sioWildcard());

		// TODO: Extract
		this.ioServer.on("connection", socket => {
			socket.on("*", async packet => {
				await this.router.route(packet, socket);
			});
		});

		if (callback) {
			callback(this);
		}
	}

	public middleware(middleware: MiddlewareBase) {
		this.router.registerCallback(RouterCallbackType.VALIDATION_ERROR, middleware.onEventValidationError);
		this.router.registerCallback(RouterCallbackType.BEFORE_EVENT, middleware.beforeEventExecution);
		this.router.registerCallback(RouterCallbackType.AFTER_EVENT, middleware.afterEventExecution);
		this.router.registerCallback(RouterCallbackType.ROUTE_NOT_FOUND, middleware.routeNotFound);
	}

	public shutdown() {
		this.ioServer.close();
	}
}
