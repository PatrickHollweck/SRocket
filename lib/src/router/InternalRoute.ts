import { Metadata } from "../utility/Metadata";
import { Request, Response } from "../io";
import { RouteConfig } from "./RouteConfig";
import { FunctionalRoute, Route } from "./Route";
import { namespaceMetadataKey } from "../decorator/Namespace";

export enum RouteType {
	functionBased,
	classBased,
	objectBased
}

export interface InternalRoute {
	config: RouteConfig;

	callOn(req: Request, res: Response): Promise<void>;
	callOnError(e: Error, req: Request, res: Response): Promise<void>;
	callOnValidationError(e: Error, req: Request, res: Response): Promise<void>;

	getRoutePath(): string;
}

export class InternalObjectRoute implements InternalRoute {
	public config: RouteConfig;
	private readonly instance: Route;

	public constructor(config: RouteConfig, instance: Route) {
		this.config = config;
		this.instance = instance;
	}

	public getRoutePath() {
		return this.config.path;
	}

	public async callOn(req: Request, res: Response) {
		if (!this.instance.on) return;
		return await this.instance.on(req, res);
	}

	public async callOnError(e: Error, req: Request, res: Response) {
		if (!this.instance.onError) return;
		return await this.instance.onError(e, req, res);
	}

	public async callOnValidationError(e: Error, req: Request, res: Response) {
		if (!this.instance.onValidationError) return;
		return await this.instance.onValidationError(e, req, res);
	}
}

export class InternalFunctionalRoute implements InternalRoute {
	public config: RouteConfig;
	private readonly instance: FunctionalRoute;

	public constructor(config: RouteConfig, instance: FunctionalRoute) {
		this.config = config;
		this.instance = instance;
	}

	public getRoutePath(): string {
		return this.config.path;
	}

	public async callOn(req: Request, res: Response): Promise<void> {
		return await this.instance(req, res);
	}

	public async callOnError(e: Error, req: Request, res: Response): Promise<void> {
		// No default impl.
	}

	public async callOnValidationError(e: Error, req: Request, res: Response): Promise<void> {
		// No default impl.
	}
}

export class InternalClassRoute implements InternalRoute {
	public config: RouteConfig;
	private readonly instance: Route;

	constructor(config: RouteConfig, instance: Route) {
		this.config = config;
		this.instance = instance;
	}

	public getRoutePath(): string {
		return this.config.path;
	}

	public async callOn(req: Request, res: Response) {
		if (!this.instance.on) return;
		return await this.instance.on(req, res);
	}

	public async callOnError(e: Error, req: Request, res: Response) {
		if (!this.instance.onError) return;
		return await this.instance.onError(e, req, res);
	}

	public async callOnValidationError(e: Error, req: Request, res: Response) {
		if (!this.instance.onValidationError) return;
		return await this.instance.onValidationError(e, req, res);
	}
}
