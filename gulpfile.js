import gulp from 'gulp';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
const sass = gulpSass(dartSass);
import sassGlob from 'gulp-sass-glob';
import plumber from 'gulp-plumber';
import postcss from 'gulp-postcss';
import csso from 'postcss-csso';
import autoprefixer from 'autoprefixer';
import browserSync from 'browser-sync';
import rename from 'gulp-rename';
import svgmin from 'gulp-svgmin';
import svgSprite from 'gulp-svg-sprite';
import squoosh from 'gulp-libsquoosh';
import del from 'del';
import htmlmin from 'gulp-htmlmin';
import gcmq from 'gulp-group-css-media-queries';
import ghpages from 'gh-pages';

// Заливка на git hub pages
export const pages = (cb) => ghpages.publish('./build', cb);

// Styles

export const styles = () => gulp.src('source/styles/styles.sass', { sourcemaps: true })
  .pipe(plumber())
  .pipe(sassGlob())
  .pipe(sass.sync().on('error', sass.logError))
  .pipe(gcmq())
  .pipe(postcss([
    autoprefixer(),
    csso()
  ]))
  .pipe(rename('styles.min.css'))
  .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
  .pipe(browserSync.stream());

// HTML

const html = () => gulp.src('source/*.html')
  .pipe(htmlmin({ collapseWhitespace: true }))
  .pipe(gulp.dest('build'));

// Images

const optimizeImages = () => gulp.src('source/img/**/*.{jpg,png}')
  .pipe(squoosh())
  .pipe(gulp.dest('build/images'));

const copyImages = () => gulp.src('source/img/**/*.{jpg,png}')
  .pipe(gulp.dest('build/images'));

// WebP

const createWebp = () => gulp.src(['source/img/**/*.{jpg,png}', '!source/img/favicons/*{png,svg}'])
  .pipe(squoosh({
    webp: {}
  }))
  .pipe(gulp.dest('build/images'));

// SVG

const svg = () => gulp.src(['source/img/**/*.svg'])
  .pipe(svgmin())
  .pipe(gulp.dest('build/images'));

// SVG Sprite

const config = {
  mode: {
    stack: true
  }
};

export const svgSprites = () => gulp.src('source/svg-sprites/*.svg')
  .pipe(svgSprite(config))
  .pipe(rename('sprite.svg'))
  .pipe(gulp.dest('build/images/svg-sprites'));

// Copy fonts, ico, webmanifest

export const copy = (done) => {
  gulp.src([
    'source/fonts/*woff2',
    'source/*.ico',
    'source/*.webmanifest'
  ], {
    base: 'source'
  })
    .pipe(gulp.dest('build'));
  done();
};

// Clean

const clean = () => del('build');

// Server

const server = (done) => {
  browserSync.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
    online: true
  });
  done();
};

// Reload

const reload = (done) => {
  browserSync.reload();
  done();
};

// Watcher

const watcher = () => {
  gulp.watch([
    './source/styles/**/*.sass',
    './source/blocks/**/*.sass'
  ], gulp.series(styles));
  gulp.watch([
    'source/*.html',
  ], gulp.series(html, reload));
};

export default gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    styles,
    html,
    createWebp,
    svg,
    svgSprites
  ),
  gulp.series(
    server,
    watcher
  ));

export const build = gulp.series(
  clean,
  copy,
  optimizeImages,
  gulp.parallel (
    styles,
    html,
    svg,
    svgSprites,
    createWebp
  ));
