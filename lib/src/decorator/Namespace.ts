import "reflect-metadata";
import { container } from "../di/SRocketContainer";
import { SRocket, Controller } from "..";

export const namespaceMetadataKey = Symbol("namespaceMetadataKey");

export function Namespace(): Function {
	return (target: object, propertyKey: string) => {
		Reflect.defineProperty(target, propertyKey, {
			get() {
				/*
				To get the socket.io namespace we need get the module property from the controller.
				This property getter runs in the scope of the object.
				That means that the current this context is the scope of the controller.
				-------------
				Afaik there is no way to tell typescript the current this context.
				So as a workaround create this self variable with the correct type.
				You will still need ´´´this as any´´´ since typescript thinks that this is any implicitly, which is not allowed.
				*/
				const self: Controller = this as any;

				return container.get(SRocket).ioServer.of(self.module.namespace);
			}
		});
	};
}
