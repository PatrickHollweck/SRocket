import "reflect-metadata";

import getDecorators from "inversify-inject-decorators";
import { Container as InversifyContainer } from "inversify";

export class AbstractContainer {
	public readonly instance: InversifyContainer;

	constructor() {
		this.instance = new InversifyContainer();
	}

	public makeDecorator(): Function {
		return getDecorators(this.instance).lazyInject;
	}
}
