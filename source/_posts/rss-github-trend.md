---
title: GitHub Trending をRSS配信する
date: 2018-12-16 11:21:04
tags:
  - [Nodejs]
  - [Express]
  - [GitHub]
code: true
---
この記事は [クソアプリ Advent Calendar 2018](https://qiita.com/advent-calendar/2018/kuso-app) 16日目の記事です。

皆さん、[Trending repositories on GitHub](https://github.com/trending) ってご存知ですか？ 名前の通りGitHub上で公開されているリポジトリのトレンドがわかるページです。今どんな技術が流行っているのか、どんなライブラリがメジャーなのかというのは、エンジニア必見な情報です。しかし、残念なことに(僕が調べた限り)では、このページのRSS配信がありません。過去には [代わりに配信してくれるサービス](http://github-trends.ryotarai.info/) があったのですが、残念なことに今は404です。なければ作ればいいじゃないかということで作りました。

[こちら](https://github.com/mohikanz/github-trend-rss) をCloneして個人の鯖なりHerokuなりで動かしてあげてください。

## 利用した言語/ライブラリ等

以下のものを用いて作成しました。

- Nodejs v10.14.2
- Express v4.16.4
- [feed](https://github.com/jpmonette/feed) v2.0.1
- [trending-github](https://github.com/ecrmnn/trending-github) v1.10

あと開発をスムーズに行うため、[Babel7](https://babeljs.io/)と[nodemon](https://nodemon.io/)を利用しました。nodemon結構オススメです。

### feed

NodejsでRSSを配信するたに利用しました。配信したい情報を投げると、いい感じにAtom 1.0/RSS 2.0/JSON Feed 1.0の形式で出力してくれます。今回はAtom 1.0を利用しています。

### trending-github

今回の肝となるライブラリです。GitHub Trendingの情報をJSON形式で返してくれます。コードを読んでみると、cheerioを利用してDOMからテキストを抜き取っているようです。つまり**GitHub側で仕様が少しでも変更されると利用できない**ということです。(今回のクソポイントその1)コード自体はすごく短いので、実際に使われる場合はぜひ一度読んでから使われることをオススメします。

## 実際のコード

```javascript
// app.js
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.disable('x-powered-by');

// APIのHeader設定
app.use((req, res, next) => {
  res.setHeader("Content-Language", "ja");
  next();
});


app.use("/feed", require("./routes/feed.js"));

app.use("/", (req, res) => {
  res.status(200).send("I'm alive")
});

app.listen(PORT, () => {
  console.log(`Listen now\nport:${PORT}`);
})

```

```javascript
// routes/feed.js
const Router = require('express').Router();
import { Feed } from 'feed';
import trending from 'trending-github';
import Moment from 'moment-timezone';

const updatedDate = new Date();

updatedDate.setHours(0);
updatedDate.setMinutes(0);
updatedDate.setSeconds(0);
updatedDate.setMilliseconds(0);


const feed = new Feed({
  title: "GitHub Trend RSS",
  description: "GitHub Trend",
  id: "https://github.com/trending",
  link: "https://github.com/trending",
  generator: "https://github.com/mohikanz/github-trend-rss",
  copyright: "(c) 2018 mohikanz",
  updated: updatedDate,
  feedLinks: {
    atom: "https://rss.oldbigbuddha.net/feed"
  }
});

Router.get("/", (req, res) => {

  const lang   = req.query.lang;
  const period = req.query.period;

  trending(period, lang).then(repos => {
    repos.forEach(repo => {
      feed.addItem({
        title: repo.name,
        id: repo.href,
        link: repo.href,
        description: repo.description,
        date: updatedDate
      });
    });

    feed.addCategory("Technology");

    console.log(updatedDate);
    res.setHeader("Last-Modified", updatedDate);
    res.status(200).send(feed.atom1());

  });

});

module.exports = Router;
```

これで無事Feedがとれます。やったね。

### 世の中そんなに甘くなかった

やったね、って感じなんですけど実は重大な処理が抜け落ちてます。実は304を返す仕組みが入ってないんですよね。(テヘペロ)RSSリーダーは一定間隔で配信鯖に接続しに行きます。その時更新がなかった場合(鯖から304が返した場合)は何も通知せず、更新があった場合(200が帰ってきた場合)のみ通知します。今の状態だと常に200を返すので通知がえらいことになってしまいます。なんとも**クソいアプリ**です。(単に未実装なだけなのでクソと言えるかわかりませんが…)無限通知が欲しい方はぜひ試してみてください。

コードは[こちら](https://github.com/mohikanz/github-trend-rss)に上げていますので、PR とか issue とかお待ちしています。
