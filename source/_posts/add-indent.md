---
title: ブログの段落頭を字下げする
date: 2020-02-19 10:43:31
tags:
  - [CSS]
  - [Hexo]
---
Web 上の文章に字下げが必要かどうかは賛否両論あります。ボクは基本的にはなくてもいいかなと思っていますが、デザインとして取り入れるのはありだな、とも思います。

このブログのデザインは「Web 上のデジタルなコンテンツ」ではなく、あえて「紙に書かれた文章」をコンセプトにしています。紙とデジタルコンテンツの融合みたいな感じです。なので、字下げをデザインとして使いたいと思い CSS で実装しました。

## CSS で段落字下げ

前提として、ひとつの段落はひとつの p タグ内に収まっているとします。

その前提の上で、以下のスタイルをあてます。

```css
p {
  text-indent: 1em;
}
```

こうすることで p タグの先頭だけが字下げされます。padding で空間を取ると先頭だけでなく全体がずれてしまうのでどうしたものかと思っていましたが、なんと字下げ用のプロパティがありました。意外と Web 上の字下げは需要が多いのかもしれません。

ちなみに `em` は親要素のフォントサイズを基準にした単位です。なので、 `1em` を指定することによってピッタリ1文字分字下げすることが可能です（多分）。

{% noindent "<code>text-indent</code> の詳細に関しては以下をご覧ください。" %}

{% noindent "text-indent - CSS: カスケーディングスタイルシート | MDN" "https://developer.mozilla.org/ja/docs/Web/CSS/text-indent" %}

## 例外を作る

字下げができて万々歳なのですが、場合によっては字下げをしたくない p タグがあったりします。

例えば、すぐ上のリンク。p タグですが、デザイン的に字下げをしてしまうと少し違和感があるようにボクは感じました。なので、先程とは別に `no-indent` という class を作って、字下げをしないという選択肢を準備しました。

```css
p {
  text-indent: 1em;
}

p.no-indent {
  text-indent: 0;
}
```

こうすることで、字下げさせたくない p タグに `class="no-indent"` を加えるだけで字下げをしなくなります。今回はあくまでデザインのための字下げなので、こういう選択肢もあると良いかなと思いました。

### Hexo を使っている場合

このブログは Hexo を使って作成しています。Hexo は Markdown 形式で書いた記事を HTML に吐き出してくれるので非常に楽なのですが、デフォルトでは吐き出すタグに毎回 `class` などの属性をつけることができません。

そのため、先程に言ったような `class=no-indent` をこの場合に限ってつけるというのができません。ボクは字下げしない段落を作るようのスクリプトを使うことで対応しています。

```javascript
// /scripts/script.js
hexo.extend.tag.register('noindent', args => {
  if (args.length == 2) {
    return '<p class="no-indent"><a href="'+ args[1] +'" target="_blank">' + args[0] + '</a></p>'
  } else {
    return '<p class="no-indent">' + args[0] + '</p>';
  }
});
```

引数１つで p タグのみ、2つならリンクになります。空白がある場合は `"` で囲むとうまくいきます。

```plan
例
{% noindent "<code>text-indent</code> の詳細に関しては以下をご覧ください。" %}

{% noindent "text-indent - CSS: カスケーディングスタイルシート | MDN" "https://developer.mozilla.org/ja/docs/Web/CSS/text-indent" %}
```
