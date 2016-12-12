/**
 * Dependencies
 * -----------------------------------------------------------------------------
 */

const bs = require('browser-sync');
const changed = require('gulp-changed');
const del = require('del');
const minimist = require('minimist');
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
 * Build options and environments
 * -----------------------------------------------------------------------------
 */

const options = minimist(process.argv.slice(2), {
  string: [ 'env' ],
  default: {
    env: 'dev',
  },
});

/**
 * Default task
 * -----------------------------------------------------------------------------
 */

gulp.task('default', (callback) => sequence(
  [ 'build' ],
  [ 'server' ],
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
 * Server
 * -----------------------------------------------------------------------------
 */

gulp.task('server', () => {
  // Create and initialize local VM server
  bs.create();
  bs.init({
    notify: false,
    server: `./${path.build}`,
    open: 'local',
    ui: false,
  });
  // Watch for file changes and run corresponding tasks
  gulp.watch(`./${path.src}/misc/**/*`, [ 'misc' ]);
  gulp.watch(`./${path.src}/views/**/*`, [ 'views' ]);
  // Watch build changes and reload browser
  bs.watch(`${path.build}/**/*`).on('change', bs.reload);
});

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
// Select source files
  .src(`${path.src}/misc/**/*`, { dot: true })
  // Check which files have changed
  .pipe(changed(path.build))
  // Save build files
  .pipe(gulp.dest(path.build))
);

/**
 * Views
 * -----------------------------------------------------------------------------
 */

gulp.task('views', () => gulp
  // Select source files
  .src(`${path.src}/views/site/**/*.pug`)
  // Check which files have changed
  .pipe(changed(path.build, {
    extension: '.html',
  }))
  // Compile Pug to HTML
  .pipe(pug({
    pretty: (options.env === 'dev') ? true : false,
    data: {
      env: options.env,
    },
  }))
  // Save build files
  .pipe(gulp.dest(path.build))
);

/**
 * GitHub Pages
 * -----------------------------------------------------------------------------
 */

gulp.task('gh-pages', () => gulp
  // Select build files
  .src(`${path.build}/**/*`)
  // Push `build` files to `master` branch
  .pipe(pages({
    branch: 'master',
  }))
);
