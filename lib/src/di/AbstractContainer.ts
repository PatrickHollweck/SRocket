import "reflect-metadata";

import { Container as InversifyContainer, interfaces } from "inversify";
import { Newable } from "../structures/Newable";

import getDecorators from "inversify-inject-decorators";

export class AbstractContainer {
	public readonly instance: InversifyContainer;

	public constructor() {
		this.instance = new InversifyContainer();
	}

	public makeDecorator(): (
		serviceIdentifier: string | symbol | Newable<any> | interfaces.Abstract<any>
	) => (proto: any, key: string) => void {
		return getDecorators(this.instance).lazyInject;
	}
}
