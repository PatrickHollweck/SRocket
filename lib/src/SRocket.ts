// tslint:disable-next-line:no-reference
/// <reference path="./typings/types.d.ts" />

import * as sio from "socket.io";
import * as sioWildcard from "socketio-wildcard";

import { Router, RouterCallbackType } from "./router";
import { getModuleConfigDecorator } from "./decorator/ModuleConfig";
import { AbstractContainer } from "./DI/AbstractContainer";
import { MiddlewareBase } from "./middleware";
import { container } from "./DI/SRocketContainer";
import { Container } from "inversify";
import { Module } from "./modules";
import { Config } from "./config";

export class SRocket {
	public config: Config;
	public ioServer: SocketIO.Server;
	
	protected router: Router;
	
	private constructor(port: number) {
		this.config = new Config();
		// TODO: Add ability to access config back
		this.ioServer = sio.listen(port);
		// TODO: Remove dependency on server.
		this.router = new Router(this.ioServer);
		
		container.instance.bind(Config).toConstantValue(this.config);
	}
	
	public static make(port: number) {
		return new SRocket(port);
	}
	
	public configureContainer(fn: (container: Container) => void) {
		fn(this.container);
	}
	
	public separationConvention(convention: string) {
		this.config.seperationConvention = convention;
		return this;
	}
	
	public modules(...modules: Module[]) {
		for(const module of modules) {
			const metadata = getModuleConfigDecorator(module);
			if(!metadata) throw new Error(`Could not get decorator for module named: ${module}`);
			
			this.router.routes.controller(metadata.controllers);
		}
		
		return this
	}
	
	public listen(callback?: Function) {
		this.ioServer.use(sioWildcard());

		// TODO: Extract
		this.ioServer.on("connection", socket => {
			socket.on("*", async packet => {
				await this.router.route(packet, socket);
			});
		});

		this.ioServer.listen(this.config.port);
		if (callback) {
			callback(this);
		}
	}

	public middleware(middleware: MiddlewareBase) {
		this.router.registerCallback(RouterCallbackType.VALIDATION_ERROR, middleware.onEventValidationError);
		this.router.registerCallback(RouterCallbackType.BEFORE_EVENT, middleware.beforeEventCall);
		this.router.registerCallback(RouterCallbackType.AFTER_EVENT, middleware.afterEventCall);
		this.router.registerCallback(RouterCallbackType.ROUTE_NOT_FOUND, middleware.routeNotFound);
	}

	public shutdown() {
		this.ioServer.close();
	}
}
