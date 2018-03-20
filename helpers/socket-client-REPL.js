var repl = require("repl");
var r = repl.start("srocket> ");

r.context.s = require("socket.io-client")("http://localhost:1340");