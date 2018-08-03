const chalk = require("chalk");

module.exports.task = function (taskName, fn) {
	console.log(chalk.bgBlueBright.black("\nSTARTING TASK -", taskName, "\n"));
	fn();
}

module.exports.logMessage = function (message) {
	console.log(chalk.yellowBright(message));
}

module.exports.logSubTask = function (message) {
	console.log(chalk.cyanBright(message));
}

module.exports.logFinish = function (taskName) {
	console.log(chalk.cyanBright("\tDONE - " + taskName));
}

module.exports.logError = function (message) {
	console.log(chalk.bgRedBright.black(message))
}

module.exports.subTask = function (taskName, finishMessage, fn) {
	module.exports.logSubTask(taskName);
	fn();

	if (finishMessage !== null && finishMessage !== "") {
		module.exports.logFinish(finishMessage);
	}
}