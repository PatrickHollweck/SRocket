var repl = require("repl");
var r = repl.start("srocket> ");

r.context.s = require("socket.io-client")("http://localhost:1340");

r.context.emitParam = function() {
	r.context.s.emit("/param", { userName: "patrick" });	
}

r.context.emitModel = function() {
	r.context.s.emit("/model", { userName: "Patrick" });
}
