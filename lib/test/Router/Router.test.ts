import { Router } from "../../src/router/Router";
import { container } from "../../src";
import { SocketRoute } from "../../src/decorator/SocketRoute";
import { RouteMetadataStore, Controller } from "../../src/router/metadata/RouteMetadataStore";

import socketIO from "socket.io";
import socketIOClient from "socket.io-client";

describe("The Router", () => {
	let router: Router;
	let sioServer: SocketIO.Server;

	let callbackMock: jest.Mock;

	const config = {
		port: 1777
	};

	class UserController extends Controller {
		@SocketRoute()
		register() {
			callbackMock();
			expect(1).toEqual(1);
		}
	}

	function createClient() {
		return socketIOClient(`http://localhost:${config.port}/`);
	}

	beforeAll(() => {
		const store = new RouteMetadataStore();

		store.buildController(UserController);
		container.bind(RouteMetadataStore).toConstantValue(store);

		callbackMock = jest.fn();
	});

	beforeEach(() => {
		sioServer = socketIO(config.port);
		router = new Router(sioServer);
		router.registerRoutes();
	});

	afterEach(done => {
		sioServer.close(() => {
			done();
		});
	});

	it("(PRE_CHECK) check if container is setup correctly", () => {
		const store = container.get(RouteMetadataStore);
		expect(store.controllers[0].routes[0].name).toEqual("register");
	});

	it("should get the routes into a callable state", done => {
		const client = createClient();

		client.emit("register");

		setInterval(() => {
			expect(callbackMock.mock.calls.length).toEqual(1);
			done();
		}, 500);
	});
});
