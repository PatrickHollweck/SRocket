import * as srocket from "./../src/";

import {Server} from "mock-socket";
import {doAssert} from "./Helpers/AsyncHelpers";
import {RouterTestUtil} from "./Helpers/RouteTestUtil";

describe("The Router", () => {
	let helper: RouterTestUtil;

	beforeEach(() => {
		const router = new srocket.Router({} as any);
		helper = new RouterTestUtil(router);
	});

	it("Should route packets", async done => {
		class route extends srocket.Route {
			on() {
				done();
			}
		}

		const tester = await helper.testRoute(route, {path: "test"});
		await tester.withData({});
	});

	it("should pass the received data to the handler if there is no validation", async done => {
		class route extends srocket.Route {
			on(req: srocket.Request) {
				doAssert(done, () => {
					expect(req.data).toHaveProperty("hello");
					expect(req.data.hello).toEqual("world");
				});
			}
		}

		const tester = await helper.testRoute(route, {path: "test"});
		await tester.withData({hello: "world"});
	});

	it("should validate model and call the correct route methods", async done => {
		let validationErrorCalls = 0;
		let onCalls = 0;

		class route extends srocket.Route {
			onValidationError() {
				console.log("Validation Error call");
				validationErrorCalls++;
			}

			on(req) {
				console.log("On Call");
				onCalls++;
			}
		}

		class RouteModel extends srocket.Model {
			@srocket.ModelProp()
			@srocket.tsV.IsDefined()
			public message: string;
		}

		const tester = await helper.testRoute(route, {path: "test", model: RouteModel});
		await tester.withData({message: "some-message"});
		await tester.withData({mEsSaGe: 1337});

		doAssert(done, () => {
			expect(validationErrorCalls).toEqual(1);
			expect(onCalls).toEqual(1);
		});
	});

	it("should validate with parameter models and call the correct route method", async done => {
		let validationErrorCalls = 0;
		let onCalls = 0;

		class route extends srocket.Route {
			onValidationError() {
				validationErrorCalls++;
			}

			on() {
				onCalls++;
			}
		}

		const tester = await helper.testRoute(route, {
			path: "test",
			data: {
				message: {
					type: String,
					rules: [
						{
							method: srocket.jsV.contains,
							args: ["patrick"]
						}
					]
				}
			}
		});

		await tester.withData({message: "patrick is a dog"});
		await tester.withData({message: 1122});

		doAssert(done, () => {
			expect(validationErrorCalls).toEqual(1);
			expect(onCalls).toEqual(1);
		});
	});
});
