export class SocketPacket implements SocketIO.Packet {
	public type: number;
	public nsp: string;
	public id: number;
	public data: Array<any>;
	
	constructor() {
		this.data = new Array<any>();
	}

	public static fromSocketIOPacket(sioPacket: SocketIO.Packet) {
		const socketPacket = new SocketPacket();
		socketPacket.type = sioPacket.type;
		socketPacket.data = sioPacket.data;
		socketPacket.nsp = sioPacket.nsp;
		socketPacket.id = sioPacket.id;
		
		return socketPacket;
	}

	public getRoutePath() {
		return this.data[0];
	}

	public getUserData() {
		return this.data[1];
	}
}