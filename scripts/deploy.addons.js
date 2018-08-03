const reader = require("readline-sync");
const shell = require("shelljs");
const chalk = require("chalk");
const fs = require("fs");

const {
	logError,
	logFinish,
	logMessage,
	logSubTask,
	subTask,
	task
} = require("./deploy-util");

console.log(chalk.bgYellowBright.black.bold("Welcome to the SRocket --ADDON-- deploy script! \n"));

if (!reader.keyInYN("Are you in the SROCKET Root directory ? - Where the Readme is?")) {
	console.log(chalk.bgRedBright.black("Please switch into the main directory and run the script again...!"));
	process.exit(0);
}

task("Compilation", () => {
	subTask("Removing files from previous builds", "Removed previous build files", () => {
		shell.exec("IF EXIST dist rmdir /s/q dist");
	});

	subTask("Compiling the Project", "Compiled", () => {
		shell.exec("tsc");
	});

	if (reader.keyInYN("\nDid the typescript compiler output from above show any errors?")) {
		logError("Please fix the errors and then run the script again... EXITING!");
		process.exit(0);
	}
});

task("Patching files", () => {

	logMessage("--- DO NOT FORGET TO UPDATE VERSION!");
	logMessage("--- DO NOT FORGET TO UPDATE VERSION!");
	logMessage("--- DO NOT FORGET TO UPDATE VERSION!");
	logMessage("--- DO NOT FORGET TO UPDATE VERSION!");
	logMessage("--- DO NOT FORGET TO UPDATE VERSION!");

	for (const addon of fs.readdirSync("./dist/addons/")) {
		fs.copyFileSync("./addons/" + addon + "/package.json", "./dist/addons/" + addon + "/package.json");
		fs.copyFileSync("./addons/" + addon + "/README.md", "./dist/addons/" + addon + "/README.md");
	}
});


task("Version Control", () => {
	subTask("Git commit", "", () => {
		if (reader.keyInYN("Do you want to make a commit to git ?")) {
			const commitMessage = reader.question("Enter the commit message: ");
			shell.exec("git stage *");
			shell.exec("git status");
			if (reader.keyInYN("Does this output look good ?")) {
				shell.exec('git commit -m "' + commitMessage + '"');
				logFinish("Committed to GIT!")
			} else {
				logError("Exiting because user choose to...");
				process.exit(0);
			}
		} else {
			logFinish("No version control commit!");
		}
	})
});