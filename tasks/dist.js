/**
 *  Gulp tasks related to deployment and distribution
 */
const gulp = require('gulp');
const zip = require('gulp-zip');
const del = require('del');
const gDestDir = 'dist';
const pkg = require('../package.json');
const version = pkg.version;
const files = [
    'package.json',
    'server.js'
];

gulp.task('dist:clean', (done) => {
    del.sync('dist', () => {
        console.log("Deleted " + gDestDir + ".");
    });

    done();
});

gulp.task('prepackage', () => {
    return gulp.src(files, { base: "." })
        .pipe(gulp.dest(`dist/aurora-proxy-${version}`));
});


gulp.task('dist', gulp.series('dist:clean', 'prepackage'), () => {
    console.log("Creating " + gDestDir + "...");
    return gulp.src('dist/aurora-proxy-*/**/*', { base: "dist" })
        .pipe(zip(`aurora-proxy-${version}.zip`))
        .pipe(gulp.dest(gDestDir));
});
