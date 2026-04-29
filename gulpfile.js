const gulp = require('gulp');
const ts = require('gulp-typescript');
const { exec } = require('child_process');

// Load your tsconfig.json settings
const tsProject = ts.createProject('tsconfig.json');

// Task: Transpile TS to JS
function buildTS() {
    return tsProject.src()
        .pipe(tsProject())
        .js
        .pipe(gulp.dest('dist')); // Outputting to a 'dist' folder is cleaner
}

// Task: Trigger bitburner-sync
// This assumes bitburner-sync is configured to watch your 'dist' folder
function sync(cb) {
    exec('npx bitburner-sync', (err, stdout, stderr) => {
        if (err) {
            console.error(`Sync Error: ${err}`);
            return cb(err);
        }
        console.log(stdout);
        cb();
    });
}

// Task: Watcher
function watchFiles() {
    // Watch all .ts files in src
    gulp.watch('src/**/*.ts', gulp.series(buildTS, sync));
}

// Export the default task
exports.default = gulp.series(buildTS, sync, watchFiles);
exports.build = buildTS;
