import { AbstractContainer } from "./AbstractContainer";

const container = new AbstractContainer();

const decorator = container.makeDecorator();
const containerInstance = container.instance;

export { containerInstance as container, decorator as inject };
