import { AbstractContainer } from "./AbstractContainer";

const container = new AbstractContainer();

const decorator = container.makeDecorator();
export { container, decorator as inject };
