---
title: Android の上にあるバーを隠す
date: 2019-07-25
tags:
  - [Android]
  - [Kotlin]
---
Android のアプリを作っていると上にある時刻とか通知アイコンが表示されてるあのバーを非表示にしたいときありますよね、とくにゲーム作ってるときとか。あそこ公式には status bar というのですが、そのステータスバーを非表示にする方法を見つけたのでメモっておきます。

公式がどうすれば良いのかを書いているので、それを参考にします。

参考: [Hide the status bar | Android Developers](https://developer.android.com/training/system-ui/status.html)

## 目指すもの

何もしないとこんな感じにあるステータスバーを

![statusbarあり](https://res.cloudinary.com/simpleisbest/image/upload/q_auto:good/v1564034250/Android%20%E3%81%AE%E4%B8%8A%E3%81%AB%E3%81%82%E3%82%8B%E3%83%90%E3%83%BC%E3%82%92%E9%9A%A0%E3%81%99/screenshot_2019-07-25_14.50.47.webp)

こんな感じで非表示にできたらゴールです。

![statusbarなし](https://res.cloudinary.com/simpleisbest/image/upload/q_auto:good/v1564034250/Android%20%E3%81%AE%E4%B8%8A%E3%81%AB%E3%81%82%E3%82%8B%E3%83%90%E3%83%BC%E3%82%92%E9%9A%A0%E3%81%99/screenshot_2019-07-25_14.52.05.webp)

## API Level 16 以上でステータスバーを非表示にする

Android 4.1 以上でステータスバーを非表示にするには、[`setSystemUiVisibility()`](https://developer.android.com/reference/android/view/View.html#setSystemUiVisibility(int)) を利用します。これを使用することによって、WindowManager を利用するときに比べて細かくステータスバーをいじることもできます。

ステータスバーを隠すためのコードは以下の通りです。

```kotlin
window.decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_FULLSCREEN
```

`actionBar?.hide()` を使うと Actionbar も隠れ、まさにフルスクリーン状態になります。

## API Level 15 以下でステータスバーを非表示にする

公式でば Theme を利用する方法と、コードで実装する方法が紹介されていました。

### Theme を利用する

アプリの Theme を `@android:style/Theme.Holo.NoActionBar.Fullscreen` にします。

これだけでステータスバーを消すことができます。

### コードで実装する

コードでステータスバーを隠す場合、`Windows Manager` を利用して Flag を設定します。

```kotlin
window.setFlags(
    WindowManager.LayoutParams.FLAG_FULLSCREEN,
    WindowManager.LayoutParams.FLAG_FULLSCREEN
)
```

API 15 以下の端末をサポートしたい場合、`Build.VERSION.SDK_INT` を利用して分岐させれば良いです。

### 2つの違い

Theme を用いた実装とコードを用いた実装、それぞれの利点は以下のとおりです。

- Theme 利用
  - コードを利用する方法に比べて簡単に実装でき、なおかつエラーになりうる箇所が少ない
  - レンダリング前の時点で UI 情報として保持しているため、画面遷移がスムーズ
- コード利用
  - ユーザの操作によって表示・非表示を切り替えることが簡単にできる

基本は Theme で実装することを考えたほうが良いでしょう。フルスクリーンにする画面がひとつしかなければコード実装でも良いかな？

## 余談

ドキュメントを読んでいるときに `less error-prone` という表現を見つけました。 `error-prone` ってなんやろな〜とぐぐってみると [Google 提供の Error Prone](https://errorprone.info/) というのを見つけました。コンパイル時に静的コード検査でよくあるエラーを発見するやつだそうです。素晴らしいツールですね。ちなみに Prone は形容詞で `〜の傾向がある` という意味らしいです。
