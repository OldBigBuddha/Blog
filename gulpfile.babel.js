'use strict';
import gulp from 'gulp';
import del from 'del';
import autoprefixer from 'gulp-autoprefixer';
import cleanCss from 'gulp-clean-css';
import Hexo from 'hexo';

const hexo = new Hexo(process.cwd(), {});

const clean = () => del(["public/**/*"]);

const generate = () => {
  return hexo.init().then(() => {
    return hexo.call('generate', {
        watch: false
    });
  })
  .then(() => hexo.exit())
  .catch(err => {
      console.log(err);
      return hexo.exit(err);
  });
};

const formatCSS = () => {
  return gulp.src(["./public/css/**/*.css"])
    .pipe(autoprefixer({
      browsers: [
        "last 2 version",
        "iOS >= 8.1",
        "Android >= 4.4"
      ],
      cascade: false
    }))
    .pipe(cleanCss())
    .pipe(gulp.dest("./public/css"));
};

const copy = () => {
  return gulp.src("./underscores/*")
  .pipe(gulp.dest("./public"));
};

export default gulp.series([clean, generate, gulp.parallel(formatCSS, copy)])();