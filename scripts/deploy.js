const reader = require("readline-sync");
const semver = require("semver");
const shell = require("shelljs");
const chalk = require("chalk");
const fs = require("fs");

const pkgJsonPath = "../package";
const pkgJson = require(pkgJsonPath);

// IDEA: Maybe use https://github.com/nuxt/consola || https://github.com/SBoudrias/Inquirer.js

console.log(chalk.bgYellowBright.black.bold("Welcome to the SRocket deploy script! \n"));

if (!reader.keyInYN("Are you in the Root directory ? - Where the Readme is?")) {
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
	subTask("Choosing new Version", "", () => {
		const releaseTypes = ["patch", "minor", "major", "prepatch", "preminor", "premajor", "prerelease"];
		const versionChoice = reader.keyInSelect(releaseTypes, "Enter the release type of the version");
		pkgJson.version = semver.inc(pkgJson.version, releaseTypes[versionChoice]);
		logMessage(`New version is: ${pkgJson.version}!`);
	});

	subTask("Writing new package.json to disk...", "Wrote package.json with new version to disk", () => {
		fs.writeFileSync("package.json", JSON.stringify(pkgJson, null, 4));
	});

	subTask(`Coping new package.json with version ${pkgJson.version} to build files`, "Copied new package.json to build files", () => {
		fs.copyFileSync("package.json", "./dist/lib/src/package.json");
	});

	subTask("Writing a readme to dist files", "Wrote new readme", () => {
		fs.writeFileSync("./dist/lib/src/README.md", "# SRocket\n-For more informations check: https://github.com/FetzenRndy/SRocket");
	});
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

task("Releasing", () => {
	if (reader.keyInYN("Did everything work until now ? - Last change to check everything!")) {
		subTask("Publishing to NPM!", "NPM PUBLISH DONE!", () => {
			shell.cd("./dist/lib/src/");
			shell.exec("npm publish");
			shell.cd("../../");
		});
	} else {
		logError("Exiting because user choose to...");
		process.exit(0);
	}
});

function task(taskName, fn) {
	console.log(chalk.bgBlueBright.black("\nSTARTING TASK -", taskName, "\n"));
	fn();
}

function subTask(taskName, finishMessage, fn) {
	logSubTask(taskName);
	fn();

	if (finishMessage !== null && finishMessage !== "") {
		logFinish(finishMessage);
	}
}

function logMessage(message) {
	console.log(chalk.yellowBright(message));
}

function logSubTask(message) {
	console.log(chalk.cyanBright(message));
}

function logFinish(taskName) {
	console.log(chalk.cyanBright("\tDONE - " + taskName));
}

function logError(message) {
	console.log(chalk.bgRedBright.black(message))
}