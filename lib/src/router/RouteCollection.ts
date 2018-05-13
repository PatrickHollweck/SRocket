import { InternalClassRoute, InternalFunctionalRoute, InternalObjectRoute, InternalRoute, RouteType } from "./InternalRoute";
import { FunctionalRoute, NestedRoute, Route } from "./Route";
import { ModuleTree, ModuleNode } from "../structures/ModuleTree";
import { ConsoleLogger, Logger } from "../logging";
import { container, inject } from "../di/SRocketContainer";
import { routeMetadataKey } from "../decorator/SocketRoute";
import { SocketPacket } from "../structures/SocketPacket";
import { ModuleConfig } from "../modules/ModuleConfig";
import { RouteConfig } from "./RouteConfig";
import { Controller } from "./Controller";
import { Metadata } from "../utility";
import { Newable } from "../structures/Newable";
import { SRocket } from "..";
import { Config } from "../config";

export class RouteCollection {
	@inject(Config) protected config: Config;
	protected moduleTree: ModuleTree;
	protected logger: Logger;

	constructor(rootModule: ModuleConfig) {
		this.logger = new ConsoleLogger("RouterC");
		this.moduleTree = new ModuleTree(rootModule);
	}

	public findForPacket(packet: SocketPacket) {
		return this.moduleTree.findRoute(packet.getRoutePath());
	}

	public find(path: string) {
		return this.moduleTree.findRoute(path);
	}

	public controller(module: ModuleConfig, ...controllers: Newable<Controller>[]) {
		for (const controller of controllers) {
			this.logger.info(`- Registering Controller : ${controller.name} - Namespace: ${module.namespace}`);

			const instance = new controller();
			this.setupController(instance, module);

			const properties = [...Object.getOwnPropertyNames(instance), ...Object.getOwnPropertyNames(controller.prototype)];

			for (const property of properties) {
				if (RouteCollection.hasValidRouteMetadata(instance, property)) {
					switch (RouteCollection.getRouteType(instance[property])) {
						case RouteType.objectBased:
							this.registerObject(instance, [], module, property);
							break;
						case RouteType.functionBased:
							this.registerFunctional(instance, [], module, property);
							break;
						case RouteType.classBased:
							this.registerClass(instance, [], module, property);
							break;
						default:
							throw new Error("Tried to register a unknown Route type");
					}
				}
			}
		}
	}

	public registerClass(target: any, namespaces: string[], module: ModuleConfig, property?: string, config?: RouteConfig) {
		const metadata = config || RouteCollection.getRouteMetadata(target, property);
		const instance: Route = RouteCollection.getRouteInstance(target, property);

		this.concatNamespace(metadata, module.namespace, ...namespaces);
		const internalRoute = new InternalClassRoute(metadata, instance);

		this.addRoute(module, internalRoute);

		// TODO: Classes should not have the nested property but we should scan for route like objects in the parent route.
		if (instance.nested) {
			for (const nestedProperty in instance.nested) {
				this.registerNestedObject(instance.nested[nestedProperty], instance, module, [...namespaces, property || ""], nestedProperty);
			}
		}
	}

	public registerFunctional(target: any, namespaces: string[], module: ModuleConfig, property?: string) {
		const metadata = RouteCollection.getRouteMetadata(target, property);
		const instance: FunctionalRoute = RouteCollection.getRouteInstance(target, property);

		this.concatNamespace(metadata, module.namespace, ...namespaces);
		const internalRoute = new InternalFunctionalRoute(metadata, instance);

		this.addRoute(module, internalRoute);
	}

	public registerObject(target: any, namespaces: string[], module: ModuleConfig, property?: string, config?: RouteConfig) {
		const metadata = config || RouteCollection.getRouteMetadata(target, property);
		const instance: Route = RouteCollection.getRouteInstance(target, property);

		this.concatNamespace(metadata, module.namespace, ...namespaces);
		const internalRoute = new InternalObjectRoute(metadata, instance);

		this.addRoute(module, internalRoute);

		if (instance.nested) {
			for (const nestedProperty in instance.nested) {
				this.registerNestedObject(instance.nested[nestedProperty], instance, module, [...namespaces, property || ""], nestedProperty);
			}
		}
	}

	public registerNestedObject(target: NestedRoute, parentRoute: Route, module: ModuleConfig, namespaces: string[], property: string) {
		if (!target.config) target.config = { path: property };

		const metadata: RouteConfig = target.config || { path: property };
		this.registerObject(parentRoute.nested, namespaces, module, property, metadata);
	}

	protected concatNamespace(route: RouteConfig, ...namespaces: string[]) {
		let completeNamespace = "";
		for (const namespace of namespaces) {
			completeNamespace += `${namespace}${this.config.separationConvention}`;
		}

		route.path = `${completeNamespace}${route.path}`;
	}

	protected static getRouteType(target: any, property?: string): RouteType {
		if (property) target = target[property];

		if (typeof target === "object") {
			return RouteType.objectBased;
		} else if (typeof target === "function") {
			if (target.prototype && typeof target.prototype.on === "function") {
				return RouteType.classBased;
			} else {
				return RouteType.functionBased;
			}
		} else {
			throw new Error("Tried to register something as a Route that is nor a object nor a function or a class/object with a 'on' function!");
		}
	}

	protected setupController(instance: Controller, module: ModuleConfig) {
		instance.module = module;
		instance.namespace = container.get(SRocket).ioServer.of(module.namespace);

		instance.namespace.on("connection", instance.$onConnect);
		instance.namespace.on("disconnect", instance.$onDisconnect);
	}

	protected static getRouteInstance(target: any, property?: string) {
		const routeType = this.getRouteType(target, property);
		switch (routeType) {
			case RouteType.functionBased:
			case RouteType.objectBased:
				return property ? target[property] : target;
			case RouteType.classBased:
				return property ? new target[property]() : new target();
			default:
				throw new Error("Could not get a Route instance for a object that is not a class function or object route!");
		}
	}

	protected static getRouteMetadata(target: any, property?: string): RouteConfig {
		let metadata: RouteConfig;
		metadata = property
			? Metadata.getPropertyDecorator(routeMetadataKey, target, property)
			: Metadata.getClassDecorator(routeMetadataKey, target);

		if (!metadata) throw new Error("Tried to register a class Route with no decorator");

		return metadata;
	}

	protected static hasValidRouteMetadata(target: any, property?: string) {
		// TODO: Poor mans implementation
		try {
			RouteCollection.getRouteMetadata(target, property);
			return true;
		} catch (error) {
			return false;
		}
	}

	protected addRoute(moduleConfig: ModuleConfig, route: InternalRoute) {
		this.logger.info(`Registering Route: ${route.getRoutePath()}`);

		let module = this.moduleTree.findModule(innerModule => innerModule.module === moduleConfig);
		if (!module) {
			module = new ModuleNode(moduleConfig);
			this.moduleTree.root.insertNode(module);
		}

		module.value.routes.push(route);
	}
}
