import "reflect-metadata";
import { Container as InversifyContainer } from "inversify";
import getDecorators from "inversify-inject-decorators";

export class AbstractContainer {
	public instance: InversifyContainer;

	constructor() {
		this.instance = new InversifyContainer();
	}

	public makeDecorator(): Function {
		return getDecorators(this.instance).lazyInject;
	}
}
