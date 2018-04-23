import { Module } from "../../../lib/src/modules";
import { ModuleConfig } from "../../../lib/src/decorator/ModuleConfig";

import { UserController } from "./Controllers/User.controller";

@ModuleConfig({
	namespace: "users",
	controllers: [
		UserController
	],
})
export class UserModule extends Module {}