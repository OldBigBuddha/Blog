---
title: Notificationを勉強し直す
date: 2019-12-01
tags:
    - [Android]
    - [Kotlin]
    - [Notification]
code: true
---

この記事は [Android #2 Advent Calendar 2019](https://qiita.com/advent-calendar/2019/android-2) 1日目の記事です。

DroidKaigi のスカラーシップの申請をするの忘れてしょんぼりしてる OJI です。全部自腹はなかなかハードではありますが、DroidKaigi 2020 も頑張って参加したいと思っています。

この記事ではタイトル通り Notification に触れていきます。触ったことはありますがいつもググって出てきたコードをコピるってことが多かったのでこの機会にしっかり理解したいと思います。ちなみにこの記事内では基本的に API Level 21 以上を前提にしています。~~これ実は [Android 初心者向け Advent Calendar 2019](https://qiita.com/advent-calendar/2019/android_beginners) のほうが良かったんじゃ…~~

この記事の作成に当たって以下の記事を参考にしていてます。

- [通知の概要 | Android Developers](https://developer.android.com/guide/topics/ui/notifiers/notifications?hl=JA)

## Android Notification の歴史

Android の通知システムは API Level 1 から存在しています。細かいことは [こちら](https://developer.android.com/guide/topics/ui/notifiers/notifications?hl=JA#compatibility) を読んでもうとして、個人的に気になったところをピックアップしておきます。

- Android 4.1(16)
  - 展開可能通知が実装可能に
  - 通知にアクションボタンがつけられるようになった
  - ユーザが設定からアプリごとに通知をオフにすることが可能に
- Android 4.4(20)
  - Android Wear（現 Wear OS）をサポート
- Android 5(21)
  - ロック画面で通知内容が見れるように
  - ヘッドアップ通知（画面の上からピョコッて出てくるやつ）が実装可能に
- Android 8(26)
  - **通知チャンネルの追加**
  - バッジの追加

Notification を実装したことはありますが、通知チャンネルが追加されてから実装したことがなかったので、今更ながらですがそこに気をつけながら実装していこうと思います。

## 通知チャンネル

Android 8から通知チャンネルというものが追加されました。8 以降で通知を行う場合、その通知は必ずひとつのチャンネルに割り当てなくてはいけません。（そうしないと通知が表示されないらしい）

開発者にとってはバージョン分岐だったコード量が増えたりと良いことありませんが、ユーザ視点で見るとチャンネルごとに通知の設定ができるので非常に使いやすいものだったりします。

## 実際に組んでみる

今回は指定した文字が表示されるだけの通知を実装します。

参考にしている公式チュートリアルでも使われていたので、AndroidX に内包されている `NotificationCompat` を利用します。余談ですが後方互換用ライブラリの名前についてる `Compat` って `Compatibility` の略なんですね、はじめて知りました。（compatibility: 互換性、適合性、両立性、和合性、親和性、融和性）

### 準備

最近の Android Studio でプロジェクトを新規作成すると自動で AndroidX が入った状態になるので追加でライブラリを入れたりする必要はありません。ちなみに `NotificationCompat` の FQCN は `androidx.core.app.NotificationCompat` です。

とりあえず `MainActivity` に Button を置いて、タップしたら通知が出るようにします。

```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(R.layout.activity_main)

    bt_notify_simple.setOnClickListener {
        // Notification を実装する
    }
}
```

### 必要最低限の通知

最小構成の通知を組んでいきます。

```kotlin
val channelId = "NOTIFICATION_CHANNEL_ID_SAMPLE"
val builder = NotificationCompat.Builder(this, channelId).apply {
    setSmallIcon(R.drawable.ic_launcher_foreground)
    setContentTitle("Notification Title")
    setContentText("本文みたいなところだよ〜ん。ある程度長い文字列を入れても大丈夫なんだよ〜ん")
    priority = NotificationCompat.PRIORITY_DEFAULT
}

// API 26 以上の場合は NotificationChannel に登録する
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
    val name = "チャンネルの名前"
    val description = "チャンネルの説明文"
    val importance = NotificationManager.IMPORTANCE_DEFAULT
    val channel = NotificationChannel(channelId, name, importance).apply {
        this.description = description
    }

    // システムにチャンネルを登録する
    val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    manager.createNotificationChannel(channel)
}

with(NotificationManagerCompat.from(this)) {
    notify(1234567, builder.build())
}
```

このコードでやると以下のような通知が出てきます。

![通知が出てる](https://res.cloudinary.com/simpleisbest/image/upload/w_1000,ar_16:9,c_fill,g_auto,e_sharpen/v1575181758/Notification%E3%82%92%E5%8B%89%E5%BC%B7%E3%81%97%E7%9B%B4%E3%81%99/screenshot_2019-12-01_15.24.56.webp)

しっかりチャンネルも作成されています。

![通知チャンネル](https://res.cloudinary.com/simpleisbest/image/upload/q_auto:good/v1575182966/Notification%E3%82%92%E5%8B%89%E5%BC%B7%E3%81%97%E7%9B%B4%E3%81%99/screen.webp)

めっちゃシンプルな通知が実装できました。

### 通知をタップしたら指定した Activity に飛ばす

通知を出すことに成功しましたが、これだけではなんの面白みもありません。通知をタップしたときにアプリを起動するようにしてみます。

今回の変更にあたって NotificationChannel 周りの変更はないので、メソッドで分離しておきます。

```kotlin
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
    createNotificationChannel(channelId)
}

--------------------

@RequiresApi(Build.VERSION_CODES.O)
fun createNotificationChannel(channelId: String) {
    val name = "チャンネルの名前"
    val description = "チャンネルの説明文"
    val importance = NotificationManager.IMPORTANCE_DEFAULT
    val channel = NotificationChannel(channelId, name, importance).apply {
        this.description = description
    }

    val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    manager.createNotificationChannel(channel)
}
```

Notification そのものをタップしたときの挙動は `setContentIntent()` で `PendingIntent` を渡すことによって実装できます。

```kotlin
// PendingIntent の作成
val intent = Intent(this, MainActivity::class.java).apply {
    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
}
val pendingIntent = PendingIntent.getActivity(this, 0, intent, 0)

val channelId = "NOTIFICATION_CHANNEL_ID_SAMPLE"
val builder = NotificationCompat.Builder(this, channelId).apply {
    setSmallIcon(R.drawable.ic_launcher_foreground)
    setContentTitle("Notification Title")
    setContentText("本文みたいなところだよ〜ん。ある程度長い文字列を入れても大丈夫なんだよ〜ん")
    priority = NotificationCompat.PRIORITY_DEFAULT

    // Pending Intent の設定
    setContentIntent(pendingIntent)
    setAutoCancel(true)             // ← タップしたときに通知を消えるようにするには true を設定する
}

if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
    createNotificationChannel(channelId)
}

with(NotificationManagerCompat.from(this)) {
    notify(1234567, builder.build())
B
```

挙動は [こちら（YouTube）](https://youtu.be/XxyX7Bkcims) で確認できます。

### アクションボタンを追加する

最後にアクションボタンを追加してみます。`addAction()` に `PendingIntent` を登録するというさっきと非常に似た実装方法ですが、このアクションに登録する動作はさきほど実装した挙動と同じであってはいけません。[ドキュメント](https://developer.android.com/training/notify-user/build-notification?hl=JA#Actions) を見るとこう書かれています。

> これは、通知のデフォルトのタップ アクションを設定する場合と同様です。ただし、アクティビティを起動する代わりに、バックグラウンドでジョブを実行する BroadcastReceiver を開始するなどのさまざまな処理を実行でき、アクションはすでに開いているアプリを中断しません。

つまりバックグラウンドで処理させたい場合に向いているわけです。ということで簡単な BroadcastReceiver を準備します。コードは [このチュートリアル](https://developer.android.com/guide/components/broadcasts.html?hl=JA) から引っ張ってきたものです。ちなみに追加できるボタンは3つまでです。

```kotlin
const val TAG = "SampleBroadcastReceiver"

class SampleBroadcastReceiver: BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        StringBuilder().apply {
            append("Action: ${intent.action}\n")
            append("URI: ${intent.toUri(Intent.URI_INTENT_SCHEME)}\n")
            toString().also { log ->
                Log.d(TAG, log)
                Toast.makeText(context, log, Toast.LENGTH_LONG).show()
            }
        }
    }
}
```

BroadcastReceiver を Pending Intent を利用して呼び出します。

```kotlin
val activityIntent = Intent(this, MainActivity::class.java).apply {
    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
}
val activityPI = PendingIntent.getActivity(this, 0, activityIntent, 0)

// アクションボタン用の Pending Intent
val toastIntent = Intent(this, SampleBroadcastReceiver::class.java)
val toastPI = PendingIntent.getBroadcast(this, 1, toastIntent, 0)

val channelId = "NOTIFICATION_CHANNEL_ID_SAMPLE"
val builder = NotificationCompat.Builder(this, channelId).apply {
    setSmallIcon(R.drawable.ic_launcher_foreground)
    setContentTitle("Notification Title")
    setContentText("本文みたいなところだよ〜ん。ある程度長い文字列を入れても大丈夫なんだよ〜ん")
    priority = NotificationCompat.PRIORITY_DEFAULT
    setContentIntent(activityPI)
    // アクションボタンを追加
    addAction(0, "Toast", toastPI)
    setAutoCancel(true)
}

// API 26 以上の場合は NotificationChannel に登録する
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
    createNotificationChannel(channelId)
}

with(NotificationManagerCompat.from(this)) {
    notify(1234567, builder.build())
}
```

挙動は [こちら（YouTube）](https://youtu.be/FXjicKODP4U) で確認できます。

## まとめ

Notification は難しいと思っていましたが、個人が遊ぶ範囲で実装する分にはそこまで難しくないように思いました。今回は触っていませんが、展開可能な通知やメディア操作に適した通知など Android の Notification はかなり自由度の高いものになっています（View を設定できたりするんで通知欄だけでゲームとかも作れるのかも…）。今回の記事を通して自分の中で通知という新しい選択肢が増えたので、今後のアプリ開発でもどんどん取り入れたいなと思っています。

[Android #2 Advent Calendar 2019](https://qiita.com/advent-calendar/2019/android-2) 2日目は [@daichan4649](https://twitter.com/daichan4649) さんです。

Twitter: [＠OJI_1941](https://twitter.com/OJI_1941)
