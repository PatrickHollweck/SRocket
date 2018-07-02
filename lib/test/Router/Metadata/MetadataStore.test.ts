import { SRequest } from "../../../src/io/SRequest";
import { SResponse } from "../../../src/io/SResponse";
import { RouteMetadataStore, Controller, ControllerMetadata } from "../../../src/router/metadata/RouteMetadataStore";
import { SocketRoute, SOCKET_ROUTE_METADATA_KEY } from "../../../src/decorator/SocketRoute";
import { SocketController } from "../../../src/decorator/SocketController";
import { SRocket } from "../../../src/start/SRocket";
import { TestSRocket } from "../../.util/SRocketTest";

describe("The Metadata Store", () => {
	let app: SRocket;
	let store: RouteMetadataStore;
	let loginMock: jest.Mock;

	let userController: ControllerMetadata;
	let adminController: ControllerMetadata;

	@SocketController()
	class UserController extends Controller {
		$onConnect(socket) {}

		$onDisconnect(socket) {}

		@SocketRoute()
		login() {
			loginMock();
		}

		@SocketRoute({
			path: "registerUser"
		})
		register() {}
	}

	@SocketController({
		prefix: "admin"
	})
	class AdminController extends Controller {
		@SocketRoute()
		signin() {}
	}

	beforeEach(async () => {
		loginMock = jest.fn();

		app = await TestSRocket.bootstrap(5555)
			.controllers(UserController, AdminController)
			.listen();

		store = app.container.get(RouteMetadataStore);

		userController = store.controllers[0];
		adminController = store.controllers[1];
	});

	afterEach(() => {
		app.close();
	});

	it("should setup controllers so that they can be called", async () => {
		expect(userController).toBeDefined();
		expect(userController.messageRoutes[0]).toBeDefined();
	});

	it("should register the connect and disconnt events", () => {
		expect(userController.connectHandlers.length).toEqual(1);
		expect(userController.disconnectHandlers.length).toEqual(1);
	});

	it("should handle route name overrides", () => {
		expect(userController.messageRoutes[1].config.path).toEqual("registerUser");
	});

	it("should perfix all routes in a prefixed controller", () => {
		expect(adminController.messageRoutes[0].config.path).toEqual("admin:signin");
	});
});
