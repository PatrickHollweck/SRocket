const reader = require("readline-sync");
const semver = require("semver");
const shell = require("shelljs");
const chalk = require("chalk");
const path = require("path");
const fs = require("fs");

const {
	logError,
	logFinish,
	logMessage,
	subTask,
	task
} = require("./deploy-util");

// IDEA: Maybe use https://github.com/nuxt/consola || https://github.com/SBoudrias/Inquirer.js

function relativePath(pathAddon) {
	return path.join(__dirname, "..", pathAddon);
}

module.exports = (basePath, packagePath) => {
	if (!shell.pwd().endsWith("srocket")) {
		console.log(chalk.bgRedBright("Error: Make sure to start the deploy script from the root srocket directory!"));
		process.exit(1);
	}

	shell.cd(basePath);
	const pkgJson = require(relativePath(packagePath));
	const originalPkgJson = JSON.parse(JSON.stringify(pkgJson));

	console.log(chalk.bgYellowBright.black.bold("Welcome to the SRocket deploy script! \n"));

	if (!reader.keyInYN("You are in - " + shell.pwd() + " - Is this the correct root folder?")) {
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
			process.exit(1);
		}
	});

	task("Patching files", () => {
		subTask("Choosing new Version", "", () => {
			const releaseTypes = ["patch", "minor", "major", "prepatch", "preminor", "premajor", "prerelease"];
			const versionChoice = reader.keyInSelect(releaseTypes, "Enter the release type of the version");

			if (versionChoice === -1) {
				logError("Cancelling...");
				process.exit(1);
			}

			pkgJson.version = semver.inc(pkgJson.version, releaseTypes[versionChoice]);
			logMessage(`New version is: ${pkgJson.version}!`);
		});

		subTask("Writing new package.json to disk...", "Wrote package.json with new version to disk", () => {
			fs.writeFileSync("package.json", JSON.stringify(pkgJson, null, 4));
		});

		subTask(`Coping new package.json with version ${pkgJson.version} to build files`, "Copied new package.json to build files", () => {
			fs.copyFileSync("package.json", "./dist/package.json");
		});

		subTask("Copying meta files to dist", "Copied meta files!", () => {
			fs.copyFileSync("./README.md", "./dist/README.md");
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
		if (reader.keyInYN("Did everything work until now ? - Last change to check everything ('n' to ext) !")) {
			subTask("Publishing to NPM!", "NPM PUBLISH DONE!", () => {
				shell.cd("./dist/");
				shell.exec("npm publish");
				shell.cd("../../");
			});
		} else {
			logError("Exiting because user choose to...");

			subTask("Restoring previous package.json", "Restored!", () => {
				fs.writeFileSync("package.json", JSON.stringify(originalPkgJson, null, 4));
			});

			process.exit(0);
		}
	});

	task("Removing build artifacts", () => {
		if (reader.keyInYN("Should the /dist folder be removed again? : ")) {
			subTask("Removing build artifacts", "Removed build artifacts", () => {
				shell.rm("-r", "/dist");
			});
		}
	});
}