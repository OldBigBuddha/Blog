---
title: make-gulpfile-v4
date: 2018-12-15
tags:
  - [JavaScript]
  - [ECMAScript]
  - [Gulp]
---
この記事は[We Are JavaScripters!【執筆初心者歓迎】 Advent Calendar 2018](https://adventar.org/calendars/2972)及び[JavaScript Advent Calendar 2018](https://qiita.com/advent-calendar/2018/javascript)15日目の記事です。

今年の8月ぐらいにNodejsを始めまして、その後色々思いついては組んでボツってという流れを5,6回やってきました。

その中で毎回悩むのが `Gulpfile` 。最初は現行のv3を使っていたのですが、どうやらv4ってのがリリースされててしかも前と比べてかなりナウく書けるということで、まとめ的な意味を込めて上記のカレンダーに参加させていただきました。

ES6より前のJSを書くなんて論外というのが持論ですので、`Gulpfile`もES6以降の構文をバンバン使っていきます。

主に以下のサイトを参考にしています。

- [gulpjs/gulp: The streaming build system](https://github.com/gulpjs/gulp)
- [【今更】pugとstylusとbabelをgulp - Qiita](https://qiita.com/sosukesuzuki/items/f1505e034a4e2c755721)

# 作るもの & 使うもの
Pug/Stylusを用いて、簡単なWebサイトを一瞬で作るためのテンプレGulpfileを作っていきます。

Gulp4とBebel7を用いて、出力先のディレクトリを鯖にあげたら接続できる状態までしていきます。

# 実際に作る
ガリゴリGulpfileを書いていきます。

## モジュール追加
まずはモジュールを追加します。

僕は`yarn`派です。

Babel系

```bash
yarn add -D @babel/core @babel/preset-env @babel/register
```

Babel 7から`babel-`から`@babel/`に変わったそうです。

---

Gulp系

```bash
yarn add -D gulp@next gulp-babel gulp-pug gulp-stylus gulp-clean-css gulp-autoprefixer del browser-sync
```

`gulp@next`じゃないとv3.9.1が入ります。ご注意ください。曖昧な記憶なのですがv3.9.1は何かが理由で`import/export`が使えなかった気がします。もしv3系で使いたい場合はv3.9.0を使われることをオススメします。

`browser-sync`をGulp系に書くのは違和感がありますがGulpで使うので良しとしましょう。

---

以下は`package.json`です。

```json
{
  "name": "static-site-template",
  "version": "1.0.0",
  "main": "index.js",
  "author": "OldBigBuddha",
  "license": "Apache-2.0",
  "devDependencies": {
    "@babel/core": "^7.1.2",
    "@babel/preset-env": "^7.1.0",
    "@babel/register": "^7.0.0",
    "browser-sync": "^2.26.3",
    "del": "^3.0.0",
    "gulp": "^4.0.0",
    "gulp-autoprefixer": "^6.0.0",
    "gulp-babel": "^8.0.0-beta.2",
    "gulp-clean-css": "^3.10.0",
    "gulp-pug": "^4.0.1",
    "gulp-stylus": "^2.7.0"
  }
}

```

## .babelrc
.babelrcを書いていきます。

BrowserListは自分用のリストを作っておくといいです。特にこだわらない方だったら5分もかからないです。(僕は色々調べたので30分ぐらいかかりましたｗ)

```json
{
  "presets": [
    ["@babel/preset-env", {
      "targets": {
        "browsers": [
          ">0.25%",
          "not ie 11"
        ]
      }
    }]
  ]
}
```

特徴はBabel7から追加された`@babel/preset-env`です。presetは他にもあるのでぜひ[こちら](https://babeljs.io/docs/en/presets#docsNav)で確認してみてください。

## GulpfileでHelloWorld
上記の設定ができたらES6以上の構文を使って`Gulpfile`が組めます。

とりあえずHelloWorldを組んでみます。

フィアル名は `gulpfile.js` **ではなく** `gulpfile.babel.js` です。ご注意ください。

```javascript
exports.default = next => {
  console.log("Hello World");
  next();
};
```

これができたら以下のコマンドで実行です。

```bash
$ npx gulp
[19:49:32] Requiring external module @babel/register
[19:49:34] Using gulpfile ~/static-site-template/gulpfile.babel.js
[19:49:34] Starting 'default'...
Hello World
[19:49:34] Finished 'default' after 3.09 ms
```

こんな感じで上手くいけます。

注意したいのは引数の`next()`、これがないと以下のエラー(？)が出ます。

タスクは実行されるのですがエラー終了と判定されます。(これが原因でNetlifyの自動ビルドが上手くいかなかった)

この引数は後で出てくる`series()`というタスクを同期的に実行するGulpの機能を使うときに重要になってきます。

## いざ本番
基本的な書き方は理解できましたので、ちゃちゃっとタスクを書いていきます。

すでに過去のGulpを書いたことがある方は、おぉと思うかもしれません。

いかのファイル構成を想定しています。

```bash
.
|-- dist
|   |-- index.html
|   |-- style
|   `-- js
|-- gulpfile.babel.js
|-- package.json
|-- src
|   |-- index.pug
|   |-- js
|   `-- style
`-- yarn.lock
```

`dist`を丸々鯖に置けば動く想定です。人によっては`public`という名前でやってたりします。(そっちのほうがいいかもしれない)

以下`gulp.babel.js`です。


```javascript
const { src, dest, series, parallel, watch, task } = require('gulp');

import del from 'del';
import pug from 'gulp-pug';
import stylus from 'gulp-stylus';
import cleanCss from 'gulp-clean-css';
import autoprefixer from 'gulp-autoprefixer';
import babel from 'gulp-babel';

const browsersync = require('browser-sync').create();

const config = {
  src: {
    root: "./src",
    pug: "./src/**/*pug",
    stylus: "./src/style/**/*.styl",
    js: "./src/js/**/*.js"
  },
  dist: {
    root: "./dist",
    style: "./dist/style",
    js: "./dist/js"
  },
}

const targetBrowser = {
  "presets": [
    ["@babel/preset-env", {
      "targets": {
        "browsers": [
          ">0.25%",
          "not ie 11"
        ]
      }
    }]
  ]
};

// BrowserSync
const browserSync = cb => {
  browsersync.init({
    server: {
      baseDir: config.dist.root
    },
    port: 3000
  });
  cb();
}

const reload = cb => {
  browsersync.reload();
  cb();
}

const clean = cb => {
  del(src(config.dist.root));
  cb();
};

const html = cb => {
  console.log("Task: HTML");
  const option =  {
    pretty: true
  };
  src(config.src.pug)
    .pipe(pug(option))
    .pipe(dest(config.src.root));
  cb();
};

const css = cb => {
  console.log("Task: CSS");
  src(config.src.stylus)
    .pipe(stylus())
    .pipe(cleanCss())
    .pipe(autoprefixer(targetBrowser))
    .pipe(dest(config.dist.style));
  cb();
};

const js = cb => {
  console.log("Task: JavaScript");
  src("./src/js/**/*.js")
    .pipe(babel())
    .pipe(dest(config.dist.js));
  cb();
}

// Watch files
function watchFiles() {
  watch(config.src.pug, series(html, reload));
  watch(config.src.stylus, css);
  watch(config.src.js, js);
}

// definition tasks
exports.clean = clean;
exports.build = series(clean, parallel(html, css, js));
exports.default = parallel(watchFiles, browserSync);
```

何からナニまでナウくていいですね。

browser-syncは初期化を必要とする & わざわざ`create()`を呼び出すためだけに変数を使いたくなかったので、`require()`を使っています。

[こちらのGist](https://gist.github.com/jeromecoupe/0b807b0c1050647eb340360902c3203a)を参考にさせてもらいました。

モジュールの書き方や、タスクの書き方が個人的に満足しています。

圧縮系はいれてないので、実際に使う場合は適宜追加してください。

# 締め
この記事ではGulp4をES6以上の構文を使って書く方法をお伝えしました。

基本的には[公式ドキュメント](https://github.com/gulpjs/gulp/tree/master/docs/getting-started)を読めば大体理解できます。

プラグインを使う場合とかはググればサンプルが色々出てくると思うので公式と照らし合わせながら書いていけばいいと思います。

最後までありがとうございました。
