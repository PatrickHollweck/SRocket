import { SRequest } from "../../../src/io/SRequest";
import { SResponse } from "../../../src/io/SResponse";
import { RouteMetadataStore, Controller } from "../../../src/router/metadata/RouteMetadataStore";
import { SocketRoute, SOCKET_ROUTE_METADATA_KEY } from "../../../src/decorator/SocketRoute";
import { SocketController } from "../../../src/decorator/SocketController";
import { SRocket } from "../../../src/start/SRocket";
import { TestSRocket } from "../../.util/SRocketTest";

describe("The Metadata Store", () => {
	let app: SRocket;
	let store: RouteMetadataStore;
	let loginMock: jest.Mock;

	@SocketController()
	class UserController extends Controller {
		$onConnect(socket) {}

		$onDisconnect(socket) {}

		@SocketRoute()
		login() {
			loginMock();
		}
	}

	beforeEach(async () => {
		loginMock = jest.fn();

		app = await TestSRocket.bootstrap(5555)
			.controllers(UserController)
			.listen();

		store = app.container.get(RouteMetadataStore);
		store.buildController(UserController);
	});

	afterEach(() => {
		app.close();
	});

	it("should setup controllers so that they can be called", async () => {
		expect(store.controllers[0]).toBeDefined();
		expect(store.controllers[0].messageRoutes[0]).toBeDefined();
	});

	it("should register the connect and disconnt events", () => {
		expect(store.controllers[0].connectHandlers.length).toEqual(1);
		expect(store.controllers[0].disconnectHandlers.length).toEqual(1);
	});
});
