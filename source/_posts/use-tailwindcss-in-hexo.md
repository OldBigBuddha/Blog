---
title: Hexo で Tailwind CSS を使う
code: true
date: 2020-12-03
tags:
  - [Hexo]
  - [Tailwind CSS]
---
現在、当ブログのスタイルを Tailwind CSS を用いることによって統一しようという試みをしています。今後ブログを Next.js へ置き換えるための準備と、Tailwind CSS の練習をすることが主な目的です。

まだ完全に書き換えられたわけではありませんが、とりあえず導入をして移行作業を行うレベルまでいけたので、Hexo にどうやって Tailwind CSS を取り入れるかをメモしておこうと思います。ちなみに Tailwind CSS 自体は初心者なので非効率な記述があるかも知れません、そこらへんはご了承ください。

前提として、このブログは Pug と Stylus で記述されています。

## Tailwind CSS のインストール

実はすでに `hexo-renderer-tailwindcss` というプラグインがあって、こいつを入れることによって案外あっさり Tailwind CSS を導入することができます。あまり更新されていませんが、生成時に PostCSS を挟むだけのコードなので、定期的にメンテされてないと嫌という方はご自身でスクリプトを書かれることをオススメします。Hexo 公式の [Render に関するページ](https://hexo.io/api/rendering) と [プラグインのコード](https://github.com/TriDiamond/hexo-renderer-tailwindcss/blob/master/lib/renderer.js) を見ればなんとなく実装できると思います。この記事では `hexo-renderer-tailwindcss` を導入した前提で話を進めていきます。

```sh
$npm i hexo-renderer-tailwindcss
# or
$yarn add hexo-renderer-tailwindcss
```

次に PostCSS 用のコンフィグファイルである `.postcssrc.js` をプロジェクトルートに作成します。

```js
// /.postcssrc.js
module.exports = {
  from: undefined,
  plugins: {
    'postcss-import': {},
    'tailwindcss': {},
    'autoprefixer': {},
  }
}
```

そして、 Tailwind CSS のコンフィグファイルも同じ場所に作っておきます。`purge` オプションには Tailwind CSS のクラスを利用しているテンプレートファイルをすべて指定します。[もし、JavaScript などを用いて動的に Tailwind CSS を使う要素を生成している場合はそのファイルも設定しなくてはいけません。](https://tailwindcss.com/docs/optimizing-for-production#basic-usage:~:text=This%20list%20should%20include%20any%20files,include%20that%20file%20in%20this%20list.)

```js
module.exports = {
  future: {},
  purge: ["./themes/chord/layout/**/*.pug"],
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [],
}
```

後は普通に Tailwind CSS を書くときと同じようにしていきます。冒頭で言及したの通り Next.js への移行を前提にした Tailwind CSS 導入ですので、スタイルは CSS で書いていきます。

スタイルシートをまとめているディレクトリに以下のファイルを作成します。

```css
/* global.css */
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";
```

これで Tailwind CSS が使えるようになりました。試しに `hexo g` でファイルを生成してみてください。`global.css` の中身が Tailwind CSS のスタイル定義で埋め尽くされているのが確認できると思います。後は `global.css` を読み込めば準備は完了です。

## Tailwind CSS を適応する際の注意点

以上でセットアップは完了したので、あとは既存のレイアウトのクラスを書き換えていくだけです。ここからは自分が実際に書いたコードを紹介していきます。

### 全体のスタイル

`body` など全体に影響する設定はすべて先ほど作成した `global.css` に書いています。

```css
/* global.css */
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";

/* Customize Base */
@layer base {
  @font-face {
    font-family: RictyDiminished;
    font-weight: 400;
    src: url("../fonts/RictyDiminished-with-FiraCode-Regular.woff")
      format("woff");
  }

  body {
    @apply h-screen;
    @apply w-screen;

    font-family: fot-tsukubrdgothic-std, sans-serif;
    @apply font-normal;

    @apply bg-gray-100;
    @apply text-gray-700;
  }

  a {
    @apply font-bold;
    @apply text-green-600;
  }

  img {
    @apply max-w-full;
    @apply py-2;
    @apply m-auto;
    @apply block;
  }
}
```

CSS 内で Tailwind CSS のクラスを適用するには、頭に `@apply` を書きます。VSCode を使っている方は [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) を導入することで幸せになれます。

### テンプレートごとのスタイル

もし記事にだけ適用させたいスタイルがある場合は別途ファイルを作成しましょう。私は `post.css` を作ってそこに記事用のスタイルを書いています。

```css
/* post.css */

/* Heading */

h1,
h2,
h3 {
  @apply my-4;
}

h2 {
  @apply text-2xl;
  @apply text-gray-700;
  ・・・
}

h2::before {
  ・・・
}

・
・
・
（続く）
```

## 所感

まだ移行初めですが、Tailwind CSS とてもいいです。`post.css` とか見てると使う意味ないのではと思われるかもしれんが、プロパティの選択肢が狭まった分デザインの調整がとてもしやすく、ストレスなくスタイルを書くことができています。今後も Web 開発をするときは Tailwind CSS を積極的に採用していこうかなと思い始めています。

今回のゴールはスタイルの書き換えではなく Next.js への移行なので、それまでのんびり気張ってやっていこうと思います。
