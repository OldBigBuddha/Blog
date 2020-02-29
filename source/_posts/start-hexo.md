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

{% noindent の環境で説明をします。メジャーバージョンが違わない限り本記事での内容は利用できるはずです。 %}

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

確認ができたら `Ctrl + C` で停止できます。

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
title: ブログのタイトル
subtitle: サブタイトル
description: "サイトの説明 空白がある場合は\"で囲む"
keywords: "Hexo,Nodejs,キーワード,コンマで区切る"
author: OldBigBuddha
language: ja
timezone: Asia/Tokyo
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

もしホスト先のルートにブログを置かない場合、`root` にブログのルートディレクトリを指定してください。上記の例では `blog-domain.net` というサーバの公開ディレクトリのルートにブログが置かれていることになっています。

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

たとえば 2020/02/29 公開予定のの記事のファイル名を `test1.html` だとすると

- `articles/:title` → `https://blog-domain.net/articles/test1.html`
- `:year/:month/:day/:title` → `https://blog-domain.net/2020/02/29/test1.html`
- `:year/:i_month/:title` → `https://blog-domain.net/2020/2/test1.html`

となります。`permalink_defaults` はよくわかってないので知ってる方いらっしゃったら教えてください。

`pretty_urls` は名前の通り URL をキレイにするための設定です。`trailing_index` は `index.html` が、`trailing_html` は `html` が無くてもアクセスができるようにするかどうかの設定です。こだわりがない限り両方 `true` にしておくことをオススメします。

この2つの設定を自分好みにしておけば最低限の設定は完了です。他の項目は後々設定しても大丈夫です。

## 記事を書く

設定ができたので記事を作成します。Hexo の記事データは設定を変更しない限り `/source/_posts/` ディレクトリに置かれています。もちろんそこへ手動でファイルを追加しても問題ありませんが、以下のコマンドでも記事が作成できます。

```command
$hexo new post "file-name"
INFO  Created: {Blogディレクトリ}/source/_posts/file-name.md
```

作成したファイルを覗いてみると以下のようになっているかと思います。

```md
---
title: file-name
date: 2020-02-29 00:37:31
tags:
---
```

`title:` には記事のタイトルを書きます。また、`tags:` には記事のタグを書きます。タグは配列なので、以下のように追加します。

```yaml
tags:
 - [tag1]
 - [tag2]
 - [tag3]
```

記事にカテゴリーを指定する場合は `category:` を追加します。カテゴリーとタグに関しては [別の方が記事にされていました](https://ipassion.tech/2019/05/07/difference-between-tags-and-categories-in-hexo/)。

Tag や Category の数だけそれらに関する `index.html` が生成されるので、無闇やたらにタグを増やさないことをオススメします。（サイズの削減や HTML 生成時間の短縮につながる。）

## ファイルの生成

記事がかけたらいよいよ公開用のファイル生成します。Hexo は Theme と呼ばれる雛形に Markdown 形式で書いた記事を当てはめて、公開用の HTML およびその他諸々を生成するツールです。この過程で生成されたものをそのままホスティングサービスに上げるとプレビューと同じものがネット上から見られるようになります。

```command
$hexo generate
INFO  Start processing
INFO  Files loaded in 96 ms
INFO  Generated: index.html
・
省略
・
INFO  Generated: 2020/02/29/test1/index.html
INFO  Generated: 2020/02/28/hello-world/index.html
INFO  29 files generated in 376 ms
$
```

これで後悔する際に必要なファイルがすべて `/public/` ディレクトリに生成されました。

## 別のデプロイ方法

もちろん `hexo generate` もしくは `hexo g` で生成したものをサーバへアップロードするのでも問題はありませんが、Hexo にはもっと便利にデプロイする方法がいくつかあります。すでに多くの先人達がさまざまなデプロイ方法を説明してくださっているので、調べてみてください。個人的なオススメは Netlify という静的サイトホスティングサービスを利用することです。無料で便利な機能を色々提供してくれるのでとても重宝しています。

- [NetlifyとGitHubを連携させ、サイトのアップロード作業を自動化する方法 | 株式会社ライトコード](https://rightcode.co.jp/blog/information-technology/netlify-github-up)
- [HexoとNetlifyで快適なブログ環境を手に入れよう！ - Adwaysエンジニアブログ](https://blog.engineer.adways.net/entry/2018/10/19/150000)

## その後のロードマップ

セットアップが完了し、記事が作成でき、デプロイ方法が決まればあとは記事を書きたいように書いていけば大丈夫です。生成されたファイルをホストサーバに置いておくだけなので、非常に高速なブログを維持できます。

そのままでももちろん問題はありませんが、外見を変更したりいろいろなものを埋め込んだりしたくなると思います。そんなとき活躍するのが Theme と Plugin です。独自のタグを作って埋め込み要素を簡単に指定したり、テーマを自分好みにカスタマイズしたりとできることはさまざまです。プラグインを Nodejs で記述できるのが Hexo の最大の利点です。（個人の感想）

今回ははじめて Hexo を触る方向けの記事としてテーマやプラグインを一切無視して解説しました。今後少しずつテーマやプラグインに関する記事を書いていこうと思います。
