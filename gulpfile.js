/**
 * Dependencies
 * -----------------------------------------------------------------------------
 */

const changed = require('gulp-changed');
const del = require('del');
const pages = require('gulp-gh-pages');
const gulp = require('gulp');
const pug = require('gulp-pug');
const sequence = require('run-sequence');

/**
 * Paths
 * -----------------------------------------------------------------------------
 */

const path = {
  src: 'src',
  build: 'build',
};

/**
 * Default task
 * -----------------------------------------------------------------------------
 */

gulp.task('default', (callback) => sequence(
  [ 'build' ],
  callback
));

/**
 * Deploy
 * -----------------------------------------------------------------------------
 */

gulp.task('deploy', (callback) => sequence(
  [ 'build' ],
  [ 'gh-pages' ],
  callback
));

/**
 * Build
 * -----------------------------------------------------------------------------
 */

gulp.task('build', (callback) => sequence(
  [ 'clean' ],
  [ 'misc' ],
  [ 'views' ],
  callback
));

/**
 * Wipe build
 * -----------------------------------------------------------------------------
 */

gulp.task('clean', () => del(`./${path.build}`));

/**
 * Miscellaneous
 * -----------------------------------------------------------------------------
 */

gulp.task('misc', () => gulp
  .src(`${path.src}/misc/**/*`, { dot: true })
  .pipe(changed(path.build))
  .pipe(gulp.dest(path.build))
);

/**
 * Views
 * -----------------------------------------------------------------------------
 */

gulp.task('views', () => gulp
  .src(`${path.src}/views/site/**/*.pug`)
  .pipe(changed(path.build, {
    extension: '.html',
  }))
  .pipe(pug())
  .pipe(gulp.dest(path.build))
);

/**
 * GitHub Pages
 * -----------------------------------------------------------------------------
 */

gulp.task('gh-pages', () => gulp
  .src(`${path.build}/**/*`)
  .pipe(pages({
    branch: 'master',
  }))
);
