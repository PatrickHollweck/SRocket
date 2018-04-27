import { AbstractContainer } from "./AbstractContainer";
import { Container } from "inversify";

const container = new AbstractContainer();

const decorator = container.makeDecorator();
const containerInstance = container.instance;
export { containerInstance as container, decorator as inject };
