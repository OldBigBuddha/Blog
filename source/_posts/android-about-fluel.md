---
title: Fuelを使ってWebAPIを叩こう
date: 2018-12-08
categories: Android
tags:
  - [Kotlin]
  - [Android]
  - [Fuel]
code: true
---
この記事は[Android Advent Calendar 2018](https://qiita.com/advent-calendar/2018/android) 9日目の記事です。

登録したときにはNotification関係を書こうと思っていたのですが、ふとWebAPIが叩きたくなったので急遽内容を変更しました

Fuelというライブラリを利用してWebAPIを叩きます

# 前提条件
この記事で出てくるコードは以下の環境で書いてます。

- AndroidStudio: 3.3.1
- Kotlin: 1.2.71
- Android Compile SDK: 28
- Android Minimum SDK: 23
- Fuel: 1.15.1
- Moshi: 1.7.0

FuelもMoshiも少し前のバージョンを利用しています。

Fuelの1.16.0がKotlin 1.3.0に対応していたので使いたかったのですが、Moshiが対応してなかったので1.2.71を利用しています。

# Fuelとは
[Fuel](https://github.com/kittinunf/Fuel/tree/1.15.1)はKotlinで書かれたHTTP通信ライブラリです。(リンク先は1.15.1のドキュメントです、ご注意ください。)

有名どころではRetrofitなどがあります。

Fuelの特徴は以下のとおりです。(READMEの内容を意訳&かいつまんだ内容です)

- HTTPの基本的なメソッド(GET/POST/PUT/DELETE/HEAD/PATCH)がサポートされている
- **同期/非同期どちらの書き方も可能**
- ファイルのDownload/Uploadが可能
- **Android開発の際、自動でHandlerを呼び出す**
- RxJava/LiveData/Gson/Jackson/Moshi/Reactor/Forgeに対応

太字にしたところが個人的に推しポイントです。

特に自動でHandlerを呼び出してくれる機能はかなり魅力的だと思います。

自動で呼び出すの意味はコードをみていただいたほうが早いと思います。

# 実際に使ってみる
実際にFuelを使ってWebAPIを叩いてみます。

今回叩くAPIは[ニコニコ動画のコンテンツ検索API](http://site.nicovideo.jp/search-api-docs/search.html)です。

VOCALOIDの曲一覧を取得して、一覧で表示するようにしようと思います。

## Gradleに依存関係を書く
`build.gradle` に利用するライブラリを書いていきます。

今回触れるライブラリには、`*` をつけています。

```
implementation 'com.android.support:design:28.0.0'
implementation 'com.android.support:cardview-v7:28.0.0'

implementation "com.github.kittinunf.fuel:fuel:1.15.1" *
implementation "com.github.kittinunf.fuel:fuel-android:1.15.1" *

implementation "com.squareup.moshi:moshi:1.7.0" *
implementation "com.squareup.moshi:moshi-kotlin:1.7.0" *

implementation 'com.squareup.picasso:picasso:2.71828'
```

[Moshi](https://github.com/square/moshi/tree/moshi-parent-1.7.0)は、Java/KotlinでJSONを扱えるようにするためのライブラリです。(リンク先のバージョン注意)

Gsonでも良かったのですが、[Gsonを使うとNon-nullにNullが入るという謎現象](https://qiita.com/egugue/items/f1f35c250f7a25768751)があったらしいのでMoshiを利用します。記事が古いので、多分なおっているとは思いますが試してる暇がなかったのでMoshiでいきます。

## Fuelの基本設定をする
必須ではありませんが、極力共通設定はまとめておきたいので、Applicationクラスを一つ用意し、そこで色々設定しておきます。

- Header
  - User-Agent
- Request Params
  - targets: 検索対象のフィールド
  - fields: レスポンスに含みたいヒットしたコンテンツのフィールド
  - _sort: ソート順をソートの方向の記号とフィールド名を連結したもので指定
  - _limit: 返ってくるコンテンツの最大数
  - _context: サービスまたはアプリケーション名

`User-Agent` を設定しているのにパラメータでわざわざ指定しなくてはいけない理由がよくわかりません。

以下は `MyApplication.kt` の内容です。

```
package net.oldbigbuddha.vocaloidranking

import android.app.Application
import com.github.kittinunf.fuel.core.FuelManager

class MyApplication: Application() {
    override fun onCreate() {
        super.onCreate()
        FuelManager.instance.basePath = "https://api.search.nicovideo.jp/api/v2/video/contents"
        FuelManager.instance.baseHeaders = mapOf("User-Agent" to "VOCALOID Ranking")
        FuelManager.instance.baseParams = listOf(
            "targets" to "tags",
            "fields" to "contentId,title,viewCounter,startTime,lengthSeconds,thumbnailUrl",
            "_sort" to "-viewCounter",
            "_limit" to "20",
            "_context" to "VOCALOID Ranking"
        )
    }
}
```

`FuelManager` を利用して共通設定を追加していきます。

ここで指定したHeaderやパラメータはAPIを叩くときに自動で追加されます。

`AndroidManifest.xml` に追記することをお忘れなく。

ついでにInternet接続をするのでPermissionも書いておきます。

```
    <uses-permission android:name="android.permission.INTERNET" />

    <application
        android:name=".MyApplication"
        ~ 以下変更なし ~
```

## レスポンスをクラスで表現する
JavaScriptなどだとJSONをそのままObjectとして扱えますが、JavaやKotlinではクラスへパースしなくてはいけません。

レスポンスを元に必要なフィールドを割り出し、フィールドのみのクラスを作成します。

Kotlinには `data class` という非常に便利な機能がありますので、それを利用してお手軽に作成できちゃいます。

`#VOCALOID殿堂入り` がついた動画一覧をリクエストした際のレスポンスが以下になります。

```
{
    "meta": {
        "status": 200,
        "totalCount": 4352,
        "id": "67e0de19-9e9b-4e5e-aaac-b2ab79671d14"
    },
    "data": [
        {
            "startTime": "2008-12-11T00:42:39+09:00",
            "lengthSeconds": 334,
            "viewCounter": 2536009,
            "contentId": "sm5508956",
            "title": "【初音ミク】ぽっぴっぽー【本店だよ！！】",
            "thumbnailUrl": "http://tn.smilevideo.jp/smile?i=5508956"
        },
        ~ 省略 ~
    ]
}
```

このレスポンスをクラス化した結果が以下になります。

```
data class ResponseData(
    val meta: Meta,
    val data: List<VideoInfo>
)

data class Meta(
    val status: Int,
    val totalCount: Int,
    val id: String
)

data class VideoInfo(
    val contentId: String,
    val title: String,
    val viewCounter: Int,
    val thumbnailUrl: String,
    val lengthSeconds: Int,
    val startTime: String
)
```

`toString()` だったり、 `equal()` はKotlinがよしなにしてくれるので実装する必要がありません(`data class` の機能)

フィールド名は、レスポンスに含まれるフィールド名をそのまま使用することでMoshiが判断して入れてくれます。

もしレスポンスのフィールド名がスネークケース等名前を変えたい場合は、Moshiの変換Adapterを自作することで解決できます。

## 実装する
準備が整ったので、実際にAPIを叩いてみようと思います。

今回はAPIを叩くことのみに注力しているため、Main ActivityにTextViewをおいてそこにレスポンスを貼るという非常に雑い仕様です。

Main ActivityにTextViewを実装しておいてください。ここでは `tv_response` という実装をしたと仮定して話を進めます。

以下すべてMain ActivityのonCreate内です。

まずはJSONパーサのMoshiを準備します。

```
val moshi = Moshi.Builder()
            .add(KotlinJsonAdapterFactory())
            .build()
```

続いて本題のFuelです。

```
Fuel.get("/search", listOf("q" to "VOCALOID殿堂入り")).responseString { request, response, result ->
    when (result) {
        is Result.Failure -> {
            Log.d("Request", request.toString())
            val ex = result.getException()
            ex.printStackTrace()
        }
        is Result.Success -> {
            val data = result.get()
            val res = moshi.adapter(ResponseData::class.java).fromJson(data)

            tv_response.text = res.data[0].toString()
        }
    }
}
```

見てわかる通り、非常に簡単にわかりやすく書けます。特にWebAPIを作ったことがある方なら見慣れた形だと思います。

`get()` の他にも `post()` や `delete()` などHTTPのメソッドに沿ったメソッドが準備されています。

パラメータは `q` しか指定されていませんが、実際に飛ぶリクエストは `MyApplication` で設定した内容も含まれています。

他にも `"/search".httpGet()` と書くことができます。Kotlinの拡張関数ってやつですね。

実際にプロダクトではどちらかに統一しとかないとカオスになります。

---

このコードは非同期の形で書いています。

例えばこの処理の下にToastを表示する処理を書いた場合、Toastが表示されてからTextViewにレスポンスが表示されます。

ということは `responseString {}` の中は別Threadなわけです。

にもかかわらず `tv_response.text = res.data[0].toString()` とViewの操作ができちゃうわけです。

これが冒頭で紹介した **「自動でHandlerを呼び出す」** です。すごくないですか⁉

(原文では _"Automatically invoke handler on Android Main Thread when using Android Module"_  と説明されています。)

これで実行してみてください。いい感じにデータが表示されます(`data class`が`toString()`をいい感じで準備してくれているので非常に見やすい)。

---

あとはViewの方をいじって満足のいく見た目にすれば完成です。

下の画像はRecylerViewとCardViewを合わせてよしなにしたやつです。

![ScreenShot](https://blog.oldbigbuddha.net/images/post/fuel-screenshot.jpg "ScreenShot")

サムネイルはFuelではなくPicassoを利用しています。

## 注意
今回は触れませんでしたが、APIによってはCookieを利用することもあると思います。

Retrofit2と違い、Fuel側でCookie管理等を一切してくれません。

なので、レスポンスのヘッダーから抜き出してSharedPreferenceで保存して…みたいな感じでやっていくといいと思います。(実際僕はそうした。)

細かいことは[こちら](https://github.com/kittinunf/Fuel/issues/263)でサポートがされているので気になる方はぜひ見てください。

# 感想
ネットワークを使うとなると、どうしても非同期という問題にぶち当たり、Android特有のThread問題(Main Thread以外でViewの操作ができない)で実装に時間がかかることが多々ありました。

特に個人開発は(モチベーション的に)スピードが命みたいなところがありますから、いちいちAsync Taskを実装してとかしてるとどうしても手間がかかってしまいます。

その辺りをちゃちゃっと実装できちゃうので個人的にはとても重宝しています。

最初はRetrofitを使うと思っていたのですが、Interfaceを実装してうんちゃらかんちゃら〜とやっているのを見てやる気を失いました。

その点Fuelはレスポンスを準備するだけでよく、しかも比較的直感的にかけるので学習コストが低く、簡単に実装できる気がします。

最後に今回作成したソースのリポジトリを貼っておくので、興味がある方はぜひ触ってみてください。

[OldBigBuddha/vocaloid-ranking: ニコニコ動画の情報を元にVOCALOID曲をスマホでランキング表示させます](https://github.com/OldBigBuddha/vocaloid-ranking)