const reader = require("readline-sync");
const fs = require("fs");

const packagePath = reader.question("Which addon do you want to publish? - Path from addons folder: ");

if (!fs.existsSync("./addons/" + packagePath)) {
	console.log("Invalid Package path!");
	process.exit(1);
}

require("./deploy.base")(
	"./addons/" + packagePath,
	"./addons/" + packagePath + "/package.json"
);