export class SocketPacket {
	constructor(public readonly data: any[]) {}

	public static fromSocketIOPacket(sioPacket: SocketIO.Packet) {
		return new SocketPacket(sioPacket);
	}

	public getRoutePath() {
		return this.data[0];
	}

	public getUserData() {
		return this.data[1];
	}

	public getAck() {
		return this.data[2];
	}

	public setRoutePath(newPath: string) {
		this.data[0] = newPath;
		return this;
	}

	public setUserData(newData: any) {
		this.data[1] = newData;
		return this;
	}
}
