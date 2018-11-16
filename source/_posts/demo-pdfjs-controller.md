---
title: pdfjs-controllerのDemoを動かすのに手こずった話
date: 2018-11-07 19:42:49
tags:
  - JavaScript
---
azu氏の[pdf.js-controller](https://github.com/azu/pdf.js-controller)をローカルで動かすのに戸惑ったので

Hexoに移行したBlogのテストも兼ねてメモ

# PDF.js-controllerって何？
azu氏が開発した、[PDF.js](https://mozilla.github.io/pdf.js/)で読み込んだPDFをスライド形式で詠み込むライブラリ

ブラウザ上でPDFファイルをスライド表示させたいな〜と探していたところ発見

# ローカルで動かす
まずはClone

```
$ git clone https://github.com/azu/pdf.js-controller
$ cd ./pdf.js-controller
```

モジュールをインストール

```
$ yarn
or
$ npm install
```

続いて `example/presentation` へ移動

```
$ cd ./example/presentation/
```

ここでもモジュールをインストール

で、 `static-server` とやらを入れてやる

```
$ yarn global add static-server
or
$ npm install -g static-server
```

あとは `npm start` としてやる

`./pdf.js-controller`内でモジュールを入れるのを忘れてたため

上手く起動しなかった

書きながらなんとも情けない内容だな〜なんて思う

最近Node.jsに触れたもんで、プライベートがどうのこうのとかよくわからない