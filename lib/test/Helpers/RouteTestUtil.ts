import {SocketPacket} from "../../src/structures/SocketPacket";
import {Newable} from "../../../dist/lib/src/structures/Newable";
import {RouteConfig} from "../../src/router/RouteConfig";
import * as srocket from "../../src";

export class RouterTestUtil {
	constructor(
		public router: srocket.Router
	) {}

	async testRoute(route: Newable<srocket.Route>, routeConfig: RouteConfig) {
		const self = this;
		this.router.register(route, routeConfig);
		return {
			async withData(data: any, callback?: VoidFunction) {
				const packet = new SocketPacket().setRoutePath(routeConfig.path).setUserData(data);
				await self.router.route(packet, {} as any);

				if (callback) {
					callback();
				}

				return this;
			}
		};
	}
}