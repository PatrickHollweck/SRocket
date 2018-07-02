import { SRocket } from "../../src/start/SRocket";
import { SocketIONamespaceMock, SocketIOServerMock } from "./SocketIOMocks";

export class TestSRocket {
	public static bootstrap(port: number) {
		return SRocket.fromIO(new SocketIOServerMock().listen(port));
	}
}
