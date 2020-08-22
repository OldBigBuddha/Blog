---
title: Netlify でビルドしてたら Nodejs のバージョンが古くて怒られた
code: false
date: 2020-08-22
tags:
  - [Netlify]
---

先日 Hexo のプラグインである [hexo-renderer-marked](https://github.com/hexojs/hexo-renderer-marked) をアップデートしたら Nodejs のバージョンが古いんだよと怒られてしまいました。Netlify はランタイムやツールのバージョンを指定することができるので、その方法をメモしておきます。

## 目標

Netlify 上で

- yarn: 1.22.0
- Nodejs: 12.18.3

が利用できるように設定します。

## Netlify の環境変数

Netlify では環境変数が自由に指定できるのですが、その環境変数を利用して設定を変更することができます。ドキュメントでは `Netlify configuration variables` という見出しで説明されていました。

Netlify の環境変数は、[Settings] -> [Build & deploy] -> [Environment] から設定できます。以下の画像が僕の現在の設定です。Ruby のバージョンが設定されているのは Build Log でこのバージョンにすると速くなるよっていうメッセージがあったのでそうしています。

![Netlify の環境設定](https://res.cloudinary.com/simpleisbest/image/upload/q_auto:good/v1598110684/Netlify%20%E3%81%A7%E3%83%93%E3%83%AB%E3%83%89%E3%81%97%E3%81%A6%E3%81%9F%E3%82%89%20Nodejs%20%E3%81%AE%E3%83%90%E3%83%BC%E3%82%B8%E3%83%A7%E3%83%B3%E3%81%8C%E5%8F%A4%E3%81%8F%E3%81%A6%E6%80%92%E3%82%89%E3%82%8C%E3%81%9F/screenshot_netlify_environment_variables.webp)

余談ですが `Environment` セクションのすぐ上に `Build image selection` というものがあり、ここからビルド用コンテナに使われる Ubuntu のバージョンを変えることができます。諸事情で古いサイトをビルドしないといけない場合とかに役立ちそうですね。
