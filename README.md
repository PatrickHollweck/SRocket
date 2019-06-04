# SRocket

A [Socket.IO](https://socket.io/docs) Framework focusing on being **type-safe**.

[![TRAVISCI Status](https://travis-ci.org/PatrickHollweck/SRocket.svg?branch=master)](https://travis-ci.org/PatrickHollweck/SRocket)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FPatrickHollweck%2FSRocket.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2FPatrickHollweck%2FSRocket?ref=badge_shield)
[![Known Vulnerabilities](https://snyk.io/test/github/PatrickHollweck/SRocket/badge.svg)](https://snyk.io/test/github/PatrickHollweck/SRocket)
[![CodeFactor](https://www.codefactor.io/repository/github/patrickhollweck/srocket/badge)](https://www.codefactor.io/repository/github/patrickhollweck/srocket)

<br />

<strong>

[📚 Docs](https://patrickhollweck.github.io/SRocket/#/)

[💨 Quickstart](https://patrickhollweck.github.io/SRocket/#/quickstart)

[📝 Source Code](https://github.com/PatrickHollweck/srocket)

</strong>

<br />

<sub>Built with ❤︎ by <a href="https://github.com/PatrickHollweck">Patrick Hollweck</a></sub>

## Sneak Peak

### Server

```ts
import { SRocket, SocketController, Controller, SocketRoute SEvent, V } from "srocket";

@SocketController()
class UserController extends Controller
{
  greet(event: SEvent) {
    const data = event.request.validate(
      V.type({
        name: V.string,
      }
    );
    
    event.response
      .withData({
        greeting: `Hey, ${data.name}`,
      })
      .invokeAck();
  }
}

SRocket.fromPort(5555)
  .controllers(UserController)
  .listen(() => console.log("SRocket listening at http://localhost:5555"));
```

### Client

```ts
const socket = io.connect("http://localhost:5555");

socket.emit("greet", { name: "Patrick" }, console.log);
>> "Hello, Patrick"
```

Interested? Visit the [docs](https://patrickhollweck.github.io/SRocket/#/)
