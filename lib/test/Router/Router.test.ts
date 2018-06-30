import { Router } from "../../src/router/Router";
import { container } from "../../src";
import { SocketRoute } from "../../src/decorator/SocketRoute";
import { RouteMetadataStore, Controller } from "../../src/router/metadata/RouteMetadataStore";

import socketIO from "socket.io";
import socketIOClient from "socket.io-client";

describe("The Router", () => {
	let router: Router;
	let sioServer: SocketIO.Server;

	let currentDone: jest.DoneCallback;
	let messageMock: jest.Mock;
	let disconnectMock: jest.Mock<SocketIO.Socket>;
	let connectMock: jest.Mock<SocketIO.Socket>;

	const config = {
		port: 1777
	};

	class UserController extends Controller {
		$onConnect(socket: SocketIO.Socket) {
			connectMock();
		}

		$onDisconnect(socket: SocketIO.Socket) {
			disconnectMock();

			// TODO: this is so bad. But for the moment I cant find a workaround.
			if (currentDone) {
				currentDone();
			}
		}

		@SocketRoute()
		register() {
			messageMock();
		}
	}

	function createClient() {
		return socketIOClient(`http://localhost:${config.port}`, { autoConnect: false });
	}

	beforeAll(() => {
		const store = new RouteMetadataStore();

		store.buildController(UserController);
		container.bind(RouteMetadataStore).toConstantValue(store);
	});

	beforeEach(() => {
		messageMock = jest.fn();
		connectMock = jest.fn();
		disconnectMock = jest.fn();

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
		expect(store.controllers[0].messageRoutes[0].config.path).toEqual("register");
	});

	it("should fire the connect and disconnect handlers", done => {
		currentDone = done;
		const client = createClient().connect();

		client.on("connect", () => {
			expect(connectMock.mock.calls.length).toEqual(1);

			client.disconnect();
		});
	});

	it("should get the routes into a callable state", done => {
		const client = createClient();

		client.emit("register");

		// TODO: Complete, when stuff is implemented....
		done();
	});
});
