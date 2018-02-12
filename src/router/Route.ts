export default abstract class Route {
	before(socket: SocketIOExt.Socket) {}
	on(socket: SocketIOExt.Socket) {}
	after(socket: SocketIOExt.Socket) {}
}