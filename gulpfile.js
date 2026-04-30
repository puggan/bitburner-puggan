const gulp = require('gulp');
const ts = require('gulp-typescript');
const { exec } = require('child_process');

const tsProject = ts.createProject('tsconfig.json');

// 1. Build Function
function buildTS() {
    return tsProject.src()
        .pipe(tsProject())
        .js
        .pipe(gulp.dest('dist'));
}

// 2. Sync Function
function syncTask(cb) {
    exec('npx bitburner-sync', (err, stdout, stderr) => {
        if (err) {
            console.error(`Sync Error: ${err}`);
            return cb(err);
        }
        console.log(stdout);
        cb();
    });
}

// 3. Watch Logic
function watchOnly() {
    // Watch src and run build + sync whenever a file changes
    gulp.watch('src/**/*.ts', gulp.series(buildTS, syncTask));
}

// --- Task Command Mapping ---

// gulp build
exports.build = buildTS;

// gulp sync
exports.sync = syncTask;

// gulp watchOnly
exports.watchOnly = watchOnly;

// gulp watch (Builds, Syncs, then starts the Watcher)
exports.watch = gulp.series(buildTS, syncTask, watchOnly);

// gulp (Default: Build and Sync only)
exports.default = gulp.series(buildTS, syncTask);