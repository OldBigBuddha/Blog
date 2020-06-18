---
title: React Component を画像に変換してダウンロードさせる
code: true
date: 2020-06-18
tags:
  - [React]
---

特定の Component を画像に変換してダウンロードする機能を実装したかったので探しました。[html2canvas](https://html2canvas.hertzen.com/) というライブラリを用いることで可能になります。

## ライブラリをインストール

npm 派は

```shell
npm i html2canvas
```

Yarn 派は

```shell
yarn add html2canvas
```

私はまだ Yarn 派です。最近は npm も速いしスクリプトがあるし npx もあるしって感じで良さそうですよね。移行したいなと思いつつも手癖で `yarn` と打ってしまいます。

## 実装

`ExportButton` をクリックすると `TargetComponent` が PNG に変換されてダウンロードされる、とういうコードです。

```js
import React from "react";

import html2canvas from "html2canvas";

const TargetComponent = () => {
  // 出力予定のコンポーネントに id を付けておく
  return (
    <div id='target-component'>
      <h1>ここが画像になるよ！</h1>
    </div>
  );
}

// html2canvas で得られる URI を用いてダウンロードさせる関数
// Ref: https://stackoverflow.com/questions/31656689/how-to-save-img-to-users-local-computer-using-html2canvas
const saveAsImage = uri => {
  const downloadLink = document.createElement("a");

  if (typeof downloadLink.download === "string") {
    downloadLink.href = uri;

    // ファイル名
    downloadLink.download = "component.png";

    // Firefox では body の中にダウンロードリンクがないといけないので一時的に追加
    document.body.appendChild(downloadLink);

    // ダウンロードリンクが設定された a タグをクリック
    downloadLink.click();

    // Firefox 対策で追加したリンクを削除しておく
    document.body.removeChild(downloadLink);
  } else {
    window.open(uri);
  }
}

const onClickExport = () => {
  // 画像に変換する component の id を指定
  const target = document.getElementById("target-component");
  html2canvas(target).then(canvas => {
    const targetImgUri = canvas.toDataURL("img/png");
    saveAsImage(targetImgUri);
});

const ExportButton () => <button onClick={() => onClickExport()}>PNG出力</button>

```

これでうまくいくはずです。[このコードを利用したサービス](https://yakubingo.fuga.dev/) があるので、動作を確認したい場合はそちらで確認してください。
