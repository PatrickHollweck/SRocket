import * as srocket from "../src/";
import {RouterTestUtil} from "./Helpers/RouteTestUtil";
import {SocketPacket} from "../src/structures/SocketPacket";
import {doAssert} from "./Helpers/AsyncHelpers";

describe("Middleware", () => {
	let app: srocket.SRocket;
	let routeHelper: RouterTestUtil
	const config = new srocket.ConfigBuilder().setPort(1335).build();

	beforeEach(() => {
		// TODO: This is opening a real connection - might be not optimal for performance.
		app = new srocket.SRocket(config);
		routeHelper = new RouterTestUtil(app.router);
	});

	it("should correctly call the router middleware functions", async done => {
		const onValidationErrorMock = jest.fn();
		const afterEventMock = jest.fn();
		const beforeEventMock = jest.fn();
		const routeNotFoundMock = jest.fn();

		class SomeMiddleware extends srocket.MiddlewareBase {
			onEventValidationError() {
				onValidationErrorMock();
			}

			afterEventCall() {
				afterEventMock();
			}

			beforeEventCall() {
				beforeEventMock();
			}

			routeNotFound() {
				routeNotFoundMock();
			}
		}

		class SomeRoute extends srocket.Route {
			onValidationError() {
				onValidationErrorMock();
			}

			before() {
				beforeEventMock();
			}

			after() {
				afterEventMock();
			}
		}

		app.use(new SomeMiddleware());

		const tester = await routeHelper.testRoute(SomeRoute, {
			path: "test",
			data: {
				message: {
					type: String
				}
			}
		});

		await tester.withData({message: "some-message"});
		await tester.withData({message: 132});
		await app.router.route(new SocketPacket().setRoutePath("/some-where-where-i-belong"), {} as any);

		doAssert(done, () => {
			expect(onValidationErrorMock.mock.calls.length).toEqual(2);
			expect(afterEventMock.mock.calls.length).toEqual(2);
			expect(beforeEventMock.mock.calls.length).toEqual(2);
			expect(routeNotFoundMock.mock.calls.length).toEqual(1);
		});
	});
});
