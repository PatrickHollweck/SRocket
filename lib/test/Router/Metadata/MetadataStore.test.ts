import { RouteMetadataStore, Controller, Route } from "../../../src/router/metadata/RouteMetadataStore";
import { SocketRoute, SOCKET_ROUTE_METADATA_KEY } from "../../../src/decorator/SocketRoute";

describe("The Metadata Store", () => {
	let store: RouteMetadataStore;
	let loginMock: jest.Mock;

	class UserController extends Controller {
		@SocketRoute()
		login() {
			loginMock();
		}
	}

	beforeEach(() => {
		loginMock = jest.fn();
		store = new RouteMetadataStore();
	});

	it("should setup controllers so that they can be called", async () => {
		store.buildController(UserController);

		expect(store.controllers[0]).toBeDefined();
		expect(store.controllers[0].routes[0]).toBeDefined();

		await store.controllers[0].routes[0].handler.callOn();

		expect(loginMock.mock.calls.length).toEqual(1);
	});
});
