---
title: Hexo でブログを始める手順
code: true
date: 2020-02-28
tags:
  - [Hexo]
---

この記事では Hexo でブログを始めるための最低限の手順を紹介します。本当に最低限なので、テーマのカスタマイズやプラグインの追加・作成・改変については一切言及しません。

## 前提条件

本記事では

- macOS Catalina 10.15.3
- Nodejs v12.16.1
- npm 6.14.1
- hexo 4.2.0

の環境で説明をします。メジャーバージョンが違わない限り本記事での内容は利用できると思います。

Windows で Hexo を触ったことがありませんが、多分 WSL を使えばこの記事の内容を参考にできると思います。

## hexo-cli をインストール

まずは hexo-cli をインストールします。

```command
$npm install hexo-cli -g
```

グローバル環境を汚したくない方は、まずブログ用のディレクトリを作成してから `--save-dev` するのもありかもしれません。

```command
$mkdir blog && cd blog
$npm init
$npm install --save-dev hexo-cli
```

もしこの方法を取られた場合、今後利用する `hexo` を `npx hexo` に置き換えて読み進めてください。この記事では `hexo-cli` をグローバルにインストールしたことを前提に話を進めていきます。（なんのこっちゃわからんという方は最初の `npm install hexo-cli -g` を実行されることをオススメします。）

## ブログのセットアップ

では、ブログをセットアップします。

ここでは `blog` という名前のブログを作成します。以下のコマンドを実行することで `blog` ディレクトリが作成され、その中にブログの雛形のようなものがダウンロードされます。

ちなみに実行時にコピーされる元はこちらです: [https://github.com/hexojs/hexo-starter](https://github.com/hexojs/hexo-starter)

```command
$hexo init blog
$cd blog
$ls
_config.yml    package.json  source/
node_modules/  scaffolds/    themes/
```

## ブログのプレビュー

ブログを確認してみましょう。`hexo server` もしくは `hexo s` をすることでローカルサーバが起動するので [localhost:4000](http://localhost:4000) に接続すると確認できます。

```command
$hexo s
INFO  Start processing
INFO  Hexo is running at http://localhost:4000 . Press Ctrl+C to stop.
```

確認ができたらターミナル上で `Ctrl + C` で停止できます。

```command
$hexo s
INFO  Start processing
INFO  Hexo is running at http://localhost:4000 . Press Ctrl+C to stop.
^CINFO  Catch you later ← Ctrl + C を押した
$
```

## Hexo の設定を見る

Hexo の挙動が確認できたところで設定を確認します。Hexo の設定は `/_config.yml` に書いてあります。今回はブログを始める上で最低限知っておくと良い項目のみをピックアップします。

`/_config.yml` に書いてある設定はテーマやプラグインで利用されることも多いです。テーマやプラグインについてここでは言及しませんが、気になる場合はそれらの GitHub リポジトリなどに説明がありますので参考にすると良いです。

### Site

ブログ全体に関わる設定です。ブログのタイトルや、作者等を設定できます。特殊な文字や改行等を入れたい場合は `"` で括るとうまく認識されます。

```yaml
# Site
title: "ブログのタイトル"
subtitle: "サブタイトル"
description: "サイトの説明"
keywords: "Hexo,Nodejs,キーワード,コンマで区切る"
author: "OldBigBuddha"
language: "ja"
timezone: "Asia/Tokyo"
```

デフォルトで使われているテーマでは、`title` と `subtitle` がヘッダー部分に使われています。また、ソースコードを見るとわかりますが `<meta>` に他の情報も使われています。

`language` には [ISO 639-1](https://ja.wikipedia.org/wiki/ISO_639-1) に登録されているコードが使えます。この記事を読んでる方は恐らく日本語で書くと思うので `ja` で OK です。また、`timezone` には [tz database](https://ja.wikipedia.org/wiki/Tz_database) に収録されたものが利用できます。この記述を省いた場合、コンピュータのタイムゾーンが適用されるそうです。

### URL

記事やサイト全体の URL に関する設定です。

```yaml
# URL
## If your site is put in a subdirectory, set url as 'http://yoursite.com/child' and root as '/child/'
url: https://blog-domain.net
root: /
permalink: posts/:title/
permalink_defaults:
pretty_urls:
  trailing_index: true # Set to false to remove trailing 'index.html' from permalinks
  trailing_html: true # Set to false to remove trailing '.html' from permalinks
```

もしホスト先のルートにブログを置かない場合、`root` にブログのルートディレクトリを指定してください。上記の例では `blog-domain.net` というサーバの public ディレクトリのルートにブログが置かれていることになっています。

`permalink` とは、記事の URL のことです。上記の例では `https://blog-domain.net/posts/{記事のファイル名}` が記事の URL になります。他にも `:year` や `:month` などがあります。使える変数は以下の通りです。

| 変数名 | 説明 |
| ----- | --- |
| :year | 記事公開日時の年（4桁） |
| :month | 記事公開日時の月（0埋めあり） |
| :i_month | 記事公開日時の月（0埋めなし） |
| :day | 記事公開日時の日（0埋めあり） |
| :i_day | 記事公開日時の日（0埋めなし） |
| :hour | 記事公開日時の時（2桁） |
| :minute | 記事公開日時の分（2桁） |
| :title | 記事のファイル名 |
| :post_title | 記事タイトル |
|:id | 記事ID（キャッシュを削除すると変わる） |
| :category | カテゴリー、記事にカテゴリーが設定されていない場合は `_config.yml` の `default_category` が使われる |

{% noindent "参考: Permalinks | Hexo" https://hexo.io/docs/permalinks %}
