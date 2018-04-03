import * as srocket from "./../src/";

import {Server} from "mock-socket";
import {SocketPacket} from "../src/structures/SocketPacket";
import {Newable} from "../../dist/lib/src/structures/Newable";
import {RouteConfig} from "../src/router/RouteConfig";
import {doAssert} from "./Helpers/AsyncHelpers";

describe("The Router", () => {
	let router: srocket.Router;

	function testRoute(route: Newable<srocket.Route>, routeConfig: RouteConfig) {
		router.register(route, routeConfig);
		return {
			withEmitData(data: any, callback?: VoidFunction) {
				const packet = new SocketPacket().setRoutePath(routeConfig.path).setUserData(data);
				router.route(packet, {} as any).then();

				if (callback) {
					callback();
				}

				return this;
			}
		}
	}

	beforeEach(() => {
		router = new srocket.Router({} as any);
	});

	it("Should route packets", done => {
		class route extends srocket.Route {
			on() {
				done();
			}
		}

		testRoute(route, {path: "test"})
			.withEmitData({});
	});

	it('should pass the received data to the handler if there is no validation', done => {
		class route extends srocket.Route {
			on(req: srocket.Request) {
				doAssert(done, () => {
					expect(req.data).toHaveProperty("hello");
					expect(req.data.hello).toEqual("world");
				});
			}
		}

		testRoute(route, {path: "test"})
			.withEmitData({hello: "world"});
	});

	it("should call the on method with the validated data when model validation was successful", done => {
		class route extends srocket.Route {
			on(req) {
				doAssert(done, () => {
					expect(req.data.message).toEqual("some-message");
				})
			}
		}

		class RouteModel extends srocket.Model {
			@srocket.ModelProp()
			@srocket.tsV.IsDefined()
			public message: string;
		}

		testRoute(route, {path: "test", model: RouteModel})
			.withEmitData({message: "some-message"});
	})

	it("should call the onValidationError method with the error when model validation fails", done => {
		class route extends srocket.Route {
			onValidationError(e) {
				doAssert(done, () => {
					expect(e).toBeInstanceOf(Error);
				})
			}
		}

		class RouteModel extends srocket.Model {
			@srocket.ModelProp()
			@srocket.tsV.IsDefined()
			public message: string;
		}

		testRoute(route, {path: "test", model: RouteModel})
			.withEmitData({mEsSaGe: 123});
	});
	
	it("should call ")
});