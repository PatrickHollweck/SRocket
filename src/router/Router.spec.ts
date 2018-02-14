const io = require('socket.io-client');
import { expect } from 'chai';

import SRocket from '../SRocket';
import { TestEvent } from '../__test__/Helpers/TestEvent';

describe('The Router', () => {

	let sender: SocketIOClient.Socket;
	let receiver: SocketIOClient.Socket;

	let srocket: SRocket;

	const socketURL = 'http://localhost:4220';

	beforeEach(done => {
		srocket = new SRocket(4220);
		srocket.router.register(TestEvent);
		srocket.listen();

		receiver = io(socketURL);
		sender = io(socketURL);
		done();
	});

	afterEach(done => {
		srocket.shutdown();
		sender.close();
		done();
	});

	it('should route packets correctly', done => {
		sender.emit('/test');
		sender.on('/test', done());
	});

	it('should route nested packets correctly', done => {
		sender.emit('/test/nested');
		sender.on('/test/nested', done());
	});

	it('should route double-nested packets correctly', done => {
		sender.emit('/test/doubleNested/nest');
		sender.on('/test/doubleNested/nest', done());
	});

});