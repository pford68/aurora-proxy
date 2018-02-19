/**
 * Gulp build tasks
 *
 * To run a clean build:
 * (1) gulp clean
 * (2) gulp build
 *
 * To start the dev server:  gulp dev
 */
const gulp = require('gulp');
const requireDir = require('require-dir');        // Imports an entire directory
const jshint = require('gulp-jshint');
//const jsdoc = require('gulp-jsdoc3');
const srcDir = "./lib";
const tasks = requireDir('./tasks');              // Gulp tasks for specific and for specific deployments (e.g., development)


//======================================================================== Tasks
/*
 Linting
 */
gulp.task('lint', () => {
    return gulp.src([`${srcDir}/**/*.js`, './server.js'])
        .pipe(jshint('.jshintrc'))
        // You can look into pretty reporters as well, but that's another story
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
});

/*
gulp.task('doc', done => {
    gulp.src(['README.md', srcDir], {read: false})
        .pipe(jsdoc(done));
});
*/


/*
 Builds the entire project.
 */
gulp.task('default', ['lint'], done => {
    done();
});
