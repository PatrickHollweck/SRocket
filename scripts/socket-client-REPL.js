var repl = require("repl");

/*
	IMPORTANT: Please only use arrow functions!
	You can access other functions / variables by using r.context.[thing] !
	"r" will be available at runtime and refers to the REPL instance.
*/

const commands = [];

function defineCommand(name, help, fn) {
	commands.push({
		name,
		help,
		fn
	});
}

defineCommand("emit", "Emits a socket event", (eventName, ...args) => {
	r.context.s.emit(eventName, ...args);
});

defineCommand("emitData", "Emits a socket event with some default data", eventName => {
	r.context.emit(eventName, {
		userName: "Patrick was here"
	});
});

defineCommand("nsp", "Joins a specific namespace", name => {
	const conn = `http://localhost:${r.context.s.io.engine.port}/${name}`;
	console.log(`Making connection to '${conn}'`);
	r.context.s = require("socket.io-client")(conn);
});

defineCommand("c", "Clears the console", () => {
	console.clear();
});

defineCommand("con", "Checks the connection and connects if it needs to.", () => {
	const isConnected = r.context.s.connected;
	console.log("Socket is connected ? :", isConnected);

	if (!isConnected) {
		console.log("Not connected... Trying to connect...");
		r.context.s.connect();

		console.log(r.context.s.connected ? "Connected..." : "Still not connected...");
	}
});

defineCommand("listen", "Listens to socket-event", (eventName, handler) => {
	r.on(eventName, handler);
});

defineCommand("help", "Displays this help text", () => {
	console.log();
	for (const command of commands) {
		const fnString = command.fn.toString();
		const signatureTerminator = fnString.indexOf("=>");
		const signature = fnString.substring(0, signatureTerminator);
		console.log(`${command.name} - ${command.help} --- Args: ${signature}`);
	}
});

// Start the repl
console.log("\nWelcome to the SROCKET client repl... Type 'help()' for help, remember to execute commands like functions\n");
const r = repl.start("SRocket -> ");

// Setup repl before setting up the commands
r.context.s = require("socket.io-client")("http://localhost:5555");

// Setup commands
for (const command of commands) {
	r.context[command.name] = command.fn;
}