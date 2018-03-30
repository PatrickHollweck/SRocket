/* -- NPM PUBLISH DEPLOY SCRIPT */

const readline = require("readline");
const shell = require("shelljs");
const fs = require("fs");

const nodeConsole = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

nodeConsole.question(
	"\nWelcome to the SRocket Deploy script! - Are you in the project root directory ? (Y/N) : ",
	rootFolderAnswer => {
		if (rootFolderAnswer !== "Y") {
			nodeConsole.write("\n Go into the root folder and try again... \n");
			exit(0);
		} else {
			nodeConsole.write(
				"\n OK - Lets get started... Step 1 - Cleaning and compiling the project - STARTING \n"
			);
			shell.exec("IF EXIST dist rmdir dist /s /q");
			nodeConsole.write(
				"\n\n DONE - previous build files cleared...! Starting the typescript compiler \n\n"
			);
			shell.exec("tsc");

			nodeConsole.question(
				"\n\nCompiled Project - Are there any errors from the compiler ? If so stop the process by answering 'N' (Y/N) : ",
				compileErrorAnswer => {
					if (compileErrorAnswer !== "Y") {
						nodeConsole.write(
							"\n\nFix the errors and come back...."
						);
						exit(0);
					} else {
						nodeConsole.write(
							"\n\nOK - Step 2 - Patching files...\n\n"
						);

						nodeConsole.question(
							"\n\nPlease replace the version in the package.json - Done ? (Y/N) : ",
							versionReplaceAnswer => {
								if (versionReplaceAnswer !== "Y") {
									nodeConsole.write(
										"\n\nPlease replace the version number and try again...\n\n"
									);
								} else {
									nodeConsole.write(
										"\n\nOK - Copying the package json into the compiled source...\n\n"
									);
									shell.exec(
										'copy "./package.json" "./dist/src/package.json"'
									);
									nodeConsole.write(
										"\n\nDONE - Patching type definitions....\n\n"
									);
									shell.exec(
										'mkdir "./dist/src/typings" && copy .\\lib\\src\\typings\\types.d.ts .\\dist\\src\\typings\\types.d.ts'
									);
									patchFileRefrences();

									nodeConsole.question(
										"\n\nOK - Step 4 - Publishing - Did everything work till now ? Check again! If so publish... (Y/N): ",
										doPublishAnswer => {
											if (doPublishAnswer !== "Y") {
												nodeConsole.write(
													"Aborting.... Fix errors and come back again..."
												);
												exit(0);
											} else {
												nodeConsole.write(
													"Almost done! Now, cd into the dist/src folder and run 'npm publish'"
												);

												nodeConsole.write(
													"DONE!!! - Published!"
												);

												exit(0);
											}
										}
									);
								}
							}
						);
					}
				}
			);
		}
	}
);

function patchFileRefrences() {
	const path = "./dist/src/srocket.d.ts";
	let file = fs.readFileSync(path, "utf8");
	file = file.replace(
		'/// <reference path="../../lib/src/typings/types.d.ts" />',
		'/// <reference path="./typings/types.d.ts" />'
	);

	fs.writeFileSync(path, file);
}
