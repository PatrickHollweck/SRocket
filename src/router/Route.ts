import { RouteConfig } from './RouteConfig';
import { NewableRoute } from './Router';

import Response from '../interaction/Response';
import Request from '../interaction/Request';

export default abstract class Route {
	on(request:Request, response:Response<any>) {}
}