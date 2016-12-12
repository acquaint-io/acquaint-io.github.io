/**
 * Dependencies
 * -----------------------------------------------------------------------------
 */

const autoprefixer = require('autoprefixer');
const bs = require('browser-sync');
const changed = require('gulp-changed');
const del = require('del');
const gulp = require('gulp');
const minimist = require('minimist');
const nano = require('gulp-cssnano');
const pages = require('gulp-gh-pages');
const postcss = require('gulp-postcss');
const pug = require('gulp-pug');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
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
  [ 'styles' ],
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
  gulp.watch(`./${path.src}/styles/**/*`, [ 'styles' ]);
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
 * Styles
 * -----------------------------------------------------------------------------
 */

gulp.task('styles', () => gulp
  // Select source files
  .src(`${path.src}/styles/*.scss`)
  // Compile Sass to CSS
  .pipe(sass({
    outputStyle: 'expanded',
  }))
  // Add vendor prefixes
  .pipe(postcss([
    require('autoprefixer'),
  ]))
  // Save unminified build files
  .pipe(gulp.dest(`${path.build}/styles`))
  // Optimize and minify
  .pipe(nano())
  // Rename file
  .pipe(rename({
    suffix: '.min',
  }))
  // Save minified build files
  .pipe(gulp.dest(`${path.build}/styles`))
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
