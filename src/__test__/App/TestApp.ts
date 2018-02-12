import SRocket from './../../SRocket';
import Route from '../../router/Route';
import { RouteConfig } from '../../router/decorator/Route';

process.env['DEBUG'] = 'srocket:*';

const srocket = new SRocket(1337);

@RouteConfig({
	name: 'Hello World:)'
})
class SomeEvent extends Route {
	before(socket: SocketIOExt.Socket) {}
	on(socket: SocketIOExt.Socket) {}
	after(socket: SocketIOExt.Socket) {}
}

class Undecorated extends Route {}

srocket.router.register(SomeEvent);

srocket.listen(() => {
  console.log(`Server is listening on ${1337}`);
});