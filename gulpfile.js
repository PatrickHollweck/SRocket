const gulp = require("gulp");
const mocha = require("gulp-mocha");

const config = {
    watchPaths: {
		ts: './lib/**/*.ts',
		specTs: './lib/**/*.spec.ts'
    }
}

gulp.task("clear-console", function() {
    console.log("\033c");
});

gulp.task("frontend-test", () => {
    gulp.src(config.watchPaths.specTs)
    .pipe(mocha({
		
        "bail": true,
        "require": ["tsconfig-paths/register", "ts-node/register"],
        "reporter": "spec",
        "checkLeaks": true,
        "timeout": 3000,
    }))
});

gulp.task("all", () => {
    gulp.watch([config.watchPaths.ts], ["clear-console", "frontend-test"]);
});

gulp.task("default", ["all"]);