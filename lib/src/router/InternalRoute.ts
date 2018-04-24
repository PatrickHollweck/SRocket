import { Request, Response } from "../io";
import { RouteConfig } from "./RouteConfig";
import { Route } from "./Route";

export class InternalRoute {
	public config: RouteConfig;
	public readonly instance: Route;
	
	public constructor(config: RouteConfig, instance: Route) {
		this.config = config;
		this.instance = instance;
	}

	public getRoutePath() {
		return this.config.path;
	}
	
	// Route Method Invokers - NOTE: This is implemented as is to ensure type-safety.
	
	public async callOn(req: Request, res: Response) {
		if(!this.instance.on) return;
		return await this.instance.on(req, res);
	}
	
	public async callBefore(req: Request, res: Response) {
		if(!this.instance.before) return;
		return await this.instance.before(req, res);
	}
	
	public async callAfter(req: Request, res: Response) {
		if(!this.instance.after) return;
		return await this.instance.after(req, res);
	}
	
	public async callOnError(e: Error, req: Request, res: Response)	{
		if(!this.instance.onError) return;
		return await this.instance.onError(e, req, res);
	}
	
	public async callOnValidationError(e: Error, req: Request, res: Response) {
		if(!this.instance.onValidationError) return;
		return await this.instance.onValidationError(e, req, res);
	}
}
