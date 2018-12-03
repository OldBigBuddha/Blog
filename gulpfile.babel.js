'use strict';
import gulp from 'gulp';
import del from 'del';
import autoprefixer from 'gulp-autoprefixer';
import cleanCss from 'gulp-clean-css';
import Hexo from 'hexo';

const hexo = new Hexo(process.cwd(), {});

const clean = done => {
  del(["public/**/*"]);
  done();
}

const generate = done => {
  hexo.init().then(() => {
    hexo.call('generate', {
        watch: false
    });
  })
  .then(() => hexo.exit())
  .catch(err => {
      console.error(err);
      hexo.exit(err);
  });
  done();
};

const formatCSS = done => {
  gulp.src(["./public/css/**/*.css"])
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
    done();
};

const copy = done => {
  return gulp.src("./underscores/*")
  .pipe(gulp.dest("./public"));
  done();
};

gulp.task("default", gulp.series(clean, generate, gulp.parallel([formatCSS, copy])));