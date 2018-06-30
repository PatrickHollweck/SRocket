import { SRequest } from "../../../src/io/SRequest";
import { SResponse } from "../../../src/io/SResponse";
import { RouteMetadataStore, Controller } from "../../../src/router/metadata/RouteMetadataStore";
import { SocketRoute, SOCKET_ROUTE_METADATA_KEY } from "../../../src/decorator/SocketRoute";

describe("The Metadata Store", () => {
	let store: RouteMetadataStore;
	let loginMock: jest.Mock;

	class UserController extends Controller {
		$onConnect(socket) {}

		$onDisconnect(socket) {}

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
		expect(store.controllers[0].messageRoutes[0]).toBeDefined();

		// await store.controllers[0].messagejRoutes[0].handler.callOn(
		// 	new SRequest({}, ),
		// 	new SResponse()
		// );

		// expect(loginMock.mock.calls.length).toEqual(1);
	});
});
