var repl = require("repl");
var r = repl.start("node> ");

r.context.s = require("socket.io-client")("http://localhost:1340");