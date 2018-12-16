---
title: GASを使っていい感じの応募フォームを作った話
date: 2018-12-16
tags:
  - [GAS]
---
この記事は[Google Apps Script Advent Calendar 2018](https://qiita.com/advent-calendar/2018/gas)16日目の記事です。

ちょうど去年の今頃に、ある団体でオリジナルトレーナーを作ろうという話が持ち上がりました。

団体規模は3桁、日本各地にいるという状態だったのでどのような流れでトレーナーを届けるか色々思案しました。

そのときにちょうどGASというものを知ったので、Google FormとSpreadSheetsとGASを使って注文フォームを作りました。

その時のコードを知見として紹介できたらなと思います。

また、記事を書くにあたって現代の文法にリメイク(リファクタリング？)しました。

# 全体の流れ
当時は以下のような流れで注文者のもとにトレーナーを届けていました。

![Process](https://blog.oldbigbuddha.net/images/post/order-process.png "Process")

今回は主に赤丸の部分について説明していきます。

# 環境構築
なるべく今風に書くにあたって、**ES6以上の構文**を使って**ローカルで**組めるようにしました。

## ローカルでGASを組む
ローカルでGASを組みには、[clasp](https://github.com/google/clasp)というGoogle製のツールを使います。

claspについては[7日目のmatsuoshi氏](https://blog.monaural.net/post/gas-and-es6-with-clasp/)や、[9日目のtakanakahiko氏](https://qiita.com/takanakahiko/items/f2b50794e8b3e00fd945)が記事として取り上げていらっしゃるので、詳細は割愛させていただきます。

## ES6以上の構文でGASを組む

両氏ともTypeScriptを用いて組まれていらっしゃるのですが、私はTypeScriptを書いたことがないのでBabelを利用してJavaScriptで書いています。

結構ゴリ押しなのですが、まずはBabelをインストールして(Babel7から名前が `babel-` から `@babel/` に変わってます。)

```
yarn add -D @babel/core @babel/cli
```

PresetとPluginを入れます。

```
yarn add -D @babel/preset-env babel-plugin-transform-member-expression-literals babel-plugin-transform-property-literals
```

PresetとPluginは[こちら](https://github.com/fossamagna/babel-preset-gas)を参考にしました。(何故か配布されているやつをインストールしても使えなかった…)

あとは `.babelrc` に記述して

```json
{
  "presets": ["@babel/preset-env"],
  "plugins": ["transform-property-literals", "transform-member-expression-literals"]
}
```

npm scriptsを設定すれば完了です。

```json
"scripts": {
  "build": "npx babel src/*.js --out-dir build"
}
```

この設定をしておけば、 `npm run build` をした後 `./dist` 下で `clasp push` をすればOKです。

一つ注意点ですが、 `clasp push` をするディレクトリに `appsscript.json` を置かなくてはいけません。(ここでちょっとハマった)

# Formを準備する
今回必要な情報は

- メールアドレス
- 名前
- フリガナ
- 郵便番号
- 住所
- トレーナーのサイズ

です。

Formはただ質問を準備するだけなので、特に説明はしません。

今回は以下のように準備しました。

![Form 1](https://blog.oldbigbuddha.net/images/post/order-form-1.png "Form 1")

![Form 2](https://blog.oldbigbuddha.net/images/post/order-form-2.png "Form 2")

郵便番号は正規表現を用いてフォーマットを固定しています。(`[0-9]{3}-[\d]{4}`)

氏名やフリガナが姓と名で分かれているのは、入力者による入力フォーマットの差を無くすためです。

# 実際に書いたコード
以下のコードはES6以降の構文を用いたものです。

FormからのResponseが保存されているシートの名前は `Original`、整形してリスト化したものを保存するシートの名前が `Roster` です。

原則として `Original` のデータは触りません。何か変更があった場合は**必ず** `Roster` のデータをいじります。(何か起こったときに修復できるように)


```javascript
const reservation = () => {

  // FormからのResponseが保存されるSheetを取得
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Original");
  reservationWithIndex(sheet.getLastRow(), sheet);

}

const reservationWithIndex = (index, sheet) => {

  const info = sheet.getRange(index, 1, 1, sheet.getLastColumn()).getValues()[0];

  const name = `${info[2]} ${info[3]}`;  // 名前
  const ruby = `${info[4]} ${info[5]}`;  // ふりがな
  const addressCode = info[6];           // 郵便番号
  const address     = info[7] + info[8]; // 住所
  const size        = info[9];           // サイズ

  const message = "メール本文";

  try {

    // MailApp.sendEmail(送信先メールアドレス, メールタイトル, メール本文)
    MailApp.sendEmail(info[1],"｛メールタイトル｝", message);

  } catch(e) {

    // エラーが出たときは自分のメールにエラー内容を送る
    MailApp.sendEmail("hogehoge@blog.oldbigbuddha.net", e.message, e.message);

  }

  // 別シートに情報を写す関数(自作)
  makeList(info);

}

// サイズの値段を計算
const calcPrice = size => {

  if      ( size === "XS" )  return "4,100";  // XSのとき
  else if ( size === "XXL" ) return "5,000";  // S,M,Lのとき
  else                       return "4,500";  // XLのとき

}

const makeList = info => {

  // 書き込み先のSheetを取得
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Roster");

  const name = `${info[2]} ${info[3]}`;  // 氏名
  const ruby = `${info[4]} ${info[5]}`;  // ふりがな
  const addressCode = info[6];           // 郵便番号
  const address = info[7] + info[8];     // 住所
  const size = info[9];                  // サイズ

  var info = [ [
    info[0], // メールアドレス
    size,
    name,
    ruby,
    addressCode,
    address
  ] ];

  // 最終行に新規注文者を追加
  sheet.getRange(sheet.getLastRow() + 1, 1, 1, 6).setValues(info);

}
```

`reservation` の実行TriggerをFormからResponseが来たときに設定しておきます。`getLastRow()` の値がその得た情報のIndexを示しています。

`reservationWithIndex` と `reservation` をわけることによって、何か情報を修正したりメールを再送信する必要ができたときに即席のfix関数を用意できるようにしています。

# 締め
コード各所にコメントを入れているので、特にコードに関する説明はしませんでした。

もしここの処理なにやってるのかわからんとか、ここはこう書いたほうがいいよっていうのがありましたら [@OJI_1941](https://www.twitter.com/OJI_1941) までお願いします。DMは閉じていますのでリプライかメンションでお願いします。

ローカルで組めたり、今どきの構文で書けたりとGASもなかなか進化しましたね。最近は[G Suite DeveloperHub](https://developers.google.com/gsuite/)が追加されたりとGASの環境が整いつつありますので、ぜひ皆さんご活用されてみてはと思います。(カレンダー経由で来た方はすでにフル活用されていることと思いますがｗ)

ありがとうございました。