const io = require('socket.io-client');
import { expect } from 'chai';

import SRocket from '../../src/SRocket';
import { TestEvent } from '../../test/Helpers/TestEvent';

process.env['DEBUG'] = 'srocket:*';

describe('The Router', () => {

	// TODO: These tests are broken - need fix later

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

	it('should throw on the route if a argument is missing', done => {
		sender.emit('/test/data', {});
		sender.on('/test/data', data => {
			expect(data.validationError).to.equal(true);
			done();
		});
	});
});