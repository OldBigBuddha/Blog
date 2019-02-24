---
title: AndroidのGradleでKotlin DSLを使う
date: 2019-02-18 14:21:05
tags:
    - [Android]
    - [Kotlin]
---
先日のDroidKaigiで [build.gradle.kts に移行しよう](https://www.youtube.com/watch?v=_s-0MbA5Gvw) というセッションがありました。最近久しぶりにAndroidを弄っているので、そのついで Gradle に Kotlin DSL を導入してみます。あとおまけで buildSrc もやってみます。

本記事で行っている内容は、以下のサイトを参考にしています。

- [DroidKaigi 2019 - build.gradle.kts に移行しよう / tnj [JA] - YouTube](https://www.youtube.com/watch?v=_s-0MbA5Gvw)
- [Multi-flavoured Kotlin DSL build script for Android App](https://proandroiddev.com/multi-flavoured-kotlin-dsl-build-script-for-android-app-2d51577e76fb)
- [Migrating Android App to Gradle Kotlin DSL 1.0 – ProAndroidDev](https://proandroiddev.com/migrating-android-app-to-gradle-kotlin-dsl-1-0-c903760275a5)
- [Gradle dependency management with Kotlin (buildSrc)](https://proandroiddev.com/gradle-dependency-management-with-kotlin-94eed4df9a28)
- [Kotlin + buildSrc for Better Gradle Dependency Management – Handstand Sam](https://handstandsam.com/2018/02/11/kotlin-buildsrc-for-better-gradle-dependency-management/)
- [build.gradle.ktsへの書き換えとハマリポイント part 1 - Qiita](https://qiita.com/chibatching/items/d63c0c9afc8e1e6bc9de)
- [Kotlin DSLを理解してみる / Understanding Kotlin DSL - Speaker Deck](https://speakerdeck.com/yagi2/understanding-kotlin-dsl)
- [簡単と聞いたbuild.gradleのkts化でハマって一日溶かした - みんからきりまで](https://kirimin.hatenablog.com/entry/2018/11/17/144158)

また、今回のプロジェクトのサンプルコードをGitHubにあげています。なるべく各ステップごとに Commit するように心掛けました。もし記事を見てよくわからないところがあったら該当する Commit を参照してみてください。(一部順番が前後していますのでお気をつけください。)

[OldBigBuddha/sample-kotlin-dsl: まっさらな新規プロジェクトにKotlin DSLを導入したやつ。](https://github.com/OldBigBuddha/sample-kotlin-dsl)

あと僕のTwitter垢は [@OJI_1941](https://twitter.com/OJI_1941) です。

# Kotlin DSL って何？
そもそも Kotlin DSL ってなんなんでしょうか。

DSL は `Domain Specific Language(ドメイン固有言語)` の略です。`micro-languages` や `little languages` とも呼ばれ、特定の領域に特化した設計がなされたプログラミング言語のことを指します。有名どころでは `XML` や `SQL`、`正規表現` などがあります。

DSLには `内部DSL` と `外部DSL` があります。違いをしっかり理解していないのですが、 `内部DSL` は **`SQL` や `XML` など完全に新しい文法が存在し、独自でパースが必要なもの** で、 `外部DSL` は **ホスト言語が既にあり、そのホストが持つ文法を拡張して特定の領域に特化させたもの** だと思っています。Kotlin DSL は **Kotlin というホスト言語を更に拡張して Grade を利用できるようにしている** ので `内部DSL` になります。

調べてみると [kotlinx.html](https://github.com/Kotlin/kotlinx.html) なんてものもあるらしいです。Kotlin で HTML が組めるという発想は好きですが、XML 系のマークアップ言語はそれなりの良さがあると思っているので個人的にはあまり好きじゃないです。

少し前に Android のレイアウトを Kotlin で組める [Anko](https://github.com/Kotlin/anko) なんてものもありましたが、あれも DSL の一種ですね。

# 始める前に
Kotlin DSL が何かわかったところで早速実際に導入していこうと思います。

いきなり既存プロジェクトに Kotlin DSL を導入するのはなかなかハードなので、今回は新規プロジェクトを作成し、真っさらな状態(？)に Kotlin DSL を導入していきます。

使用するバージョンは以下のとおりです。

- Kotlin: 1.3.21
- Gradle: 5.2.1
- Android Gradle Plugin: 3.3.1
- Android Studio: 3.3.1
- minSdk: 21
- targetSdk: 28

`AndroidX` を導入しています。

構成が決まったところでプロジェクトを新規作成して色々やっていたのですが、どうも上手くいきませんでした。

色々見てた結果 [きりみんちゃんの記事](https://kirimin.hatenablog.com/entry/2018/11/17/144158) を見つけて、マシンに入っている Gradle をアップデートしたらいけました。Kotlin DSL を導入する前に、ローカルの Gradle を確認しておいたほうがいいかもしれません。

# 新規プロジェクト作成
ローカルのGradleも見直したところでプロジェクトを新規作成します。

最初の Activity は `Empty Activity` を選択。言語はもちろん Kotlin で、Minimum API Level は Android 5.0(Lollipop)、 `Use AndroidX artifacts` にチェックを入れます。後はご自由にどうぞ。

プロジェクトができたら、念の為にできたてほやほやの状態で動かしてみます。稀にここで詰んでるのに気づかず開発を進めてしまって謎のエラーに苦しめられることがあります。

# 下ごしらえ
プロジェクトが無事動くことを確認したら、下ごしらえを行います。この下ごしらえを先にやっておくと、導入がスムーズになります。

## ライブラリを最新にする
プロジェクト生成後、 `app/build.gradle` の `dependencies` を確認し、もし古いバージョンだと注意がでたら `Alt + Enter` で最新にしてあげます。最新にしたら `Gradle Sync` を行い、Build が通ることを確認します。

## Gradle のバージョンを上げる。
2019/02/23 現在、Gradle の最新バージョンは 5.2.1 なので、それを使うように設定します。

`/gradle/wrapper/gradle-wrapper.properties` を開き、`distributionUrl` を変更します。

```
distributionUrl=https\://services.gradle.org/distributions/gradle-5.2.1-all.zip
```

これで Gradle 5.2.1が利用できます。

## 可能な限り Kotlin の記法に近づける
Groovy は代入や関数を呼び出す際、 `=` や `()` を省略することができます。また、文字列に `'` と `"` の両方が使えるなど、Kotlin の記法とは違った書き方が可能になっています。Android Studio が生成するファイルもそのことが使われており、 文字列に `'` が使われていたり、`=` と `()` が省略されていたりしますので、その部分を Kotlin の記法に近づけていきます。(なんでJavaの記法に近づけなかったのか疑問。)

この時点でファイルのリネームは行いません。

まずは最も記述量の少ない `/setting.gradle`。

文字列を `"` で囲んであげ、関数である `include` に `()` を付けてあげます。

```groovy
include("app")
```

置換できたら確認のため `Sync Gradle` をしておきます。

Sync が上手くいったら次のファイルにいきます。書き換えて Sync して、エラーが出たらエラー箇所なおしてまた Sync しての繰り返しです。

`/gradle.build` でやることは先ほどとほとんど一緒です。今回は `ext.kotlin_version` を削除しているので、`app/build.gradle` の `dependencies` にある `kotlin-stdlib` のバージョンを書き換えることに注意してください。

```groovy
// FilePath: /build.gradle

buildscript {
    repositories {
        google()
        jcenter()
    }
    dependencies {
        classpath("com.android.tools.build:gradle:3.3.1")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:1.3.21")
    }
}

allprojects {
    repositories {
        google()
        jcenter()
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}
```

```groovy
// FilePath: /app/build.gradle

// 省略 …

dependencies {
    implementation fileTree(dir: "libs", include: ["*.jar"])
    implementation "org.jetbrains.kotlin:kotlin-stdlib-jdk7:1.3.21"
    // 省略 …
```

最後の `app/gradle.build` は書き換えるところが結構あります。

まずは `apply plugin` を `plugin{}` に書き換えます。現在は **公式が `plugin{}` を推奨** しており、`apply plugin` はレガシーなものとなっています。

続いて `android{}` を書き直していくのですが、ここで一つ面倒なことがあります。Groovy は **関数呼び出しと変数代入の構文が同じ** なのです。(`()` と `=` が省略できるので両方共 `hoge fuga` の形が可能であり、しかもパッと見どれがどっちかがわからない。) `android{}` の中では、**SDKのバージョンを指定するところと `proguardFiles`** が関数です。

あとは `'` を `"` に書き換えて完成です。

```groovy
plugins {
    id("com.android.application")
    id("kotlin-android")
    id("kotlin-android-extensions")
}

android {
    compileSdkVersion(28)
    defaultConfig {
        applicationId = "<Package name>"
        minSdkVersion(21)
        targetSdkVersion(28)
        versionCode = 1
        versionName = "1.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }
    buildTypes {
        release {
            minifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
}

dependencies {
    implementation fileTree(dir: "libs", include: ["*.jar"])
    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk7:1.3.21")
    implementation("androidx.appcompat:appcompat:1.1.0-alpha02")
    implementation("androidx.core:core-ktx:1.1.0-alpha04")
    implementation("androidx.constraintlayout:constraintlayout:1.1.3")
    testImplementation("junit:junit:4.12")
    androidTestImplementation("androidx.test:runner:1.1.2-alpha01")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.1.2-alpha01")
}
```

これで下ごしらえは完了です、お疲れ様でした。これだけでも個人的にはかなり見やすくなった気がします。

# ファイル名をリネームしていく
下ごしらえが完了しましたので、どんどんファイル名に `.kts` を付与していきます。下ごしらえをしてあるのでリネーム後の修正は少しで済みます。

まずは `setting.gradle` を `setting.gradle.kts` へ。Kotlin DSL を適用することによる構文変更はありません。

ファイルを選択した状態で `Shift + F6` でリネームできます。`Cannot rename script class 'settings' to 'settings.gradle'` と忠告が出ますが無視して `Continue` を選択。

リネームをすると、左のツリーにいたぞうさんに Kotlin のロゴマークがくっつきます。また、 リネーム後に Build をすると、引数名が表示されたりメソッド名が黄色くなったりします。Kotlin の構文解析が効いている証拠ですね。この調子でどんどん変更していきます。

`/build.gradle` は少し修正が必要です。一番下にある `clean` タスクの宣言方法が代わります。以下のコードはそのタスク部分だけを記載しています。

```
// Before
task clean(type: Delete) {
    delete rootProject.buildDir
}

// After
tasks.register("clean", Delete::class.java) {
    delete(rootProject.buildDir)
}
```

修正をすると見慣れた Syntax highlight になります。Kotlin らしくなってきましたね。

そして最後の `app/build.gradle` です。例の如く修正多めです。

リネーム直後、 `android{}` 以下が真っ赤になると思います。嫌気がしますね。ですが、根気よく修正していきましょう。

まずは `android{}` の `buildTypes{}` にある `release{}` を `getByName("release"){}` に修正します。そして、その中にある `minifyEnabled` を `isMinifyEnabled` に書き換えます。

書き換えると上のバナーに ”There are new script dependencies available.” と出てきます。ここで **`Enable auto-reload` を選択** します。

もう一度書いておきます、**`Enable auto-reload` を選択します**。(ここで無視して上手くいかず、1日ほど溶かした。)

そして最後に、`dependencies` の恐らく1番上にある `fileTree` をとりあえずコメントアウトしておきます。Groovy と Kotlin では Map の書き方が違うので、このままでは Build が通りません。今はとりあえず真っ赤な状態をなくしたいので、

Enable にした後、Build を行うとさっきのエラーが嘘だったかのように Syntax Highlight が効き、全タスク実行されます。

もし先ほどコメントアウトした行を復活させたい(ローカルライブラリを利用したい)場合は `implementation(fileTree(mapOf("dir" to "libs", "include" to listOf("*.jar"))))` と書くと幸せになります。あと、`plugin{}` の中で `kotlin()` が利用できるようになります。

```kotlin
plugins {
    id("com.android.application")
    kotlin("android")
    kotlin("android.extensions")
}

android {
    compileSdkVersion(28)
    defaultConfig {
        applicationId = "<Package name>"
        minSdkVersion(21)
        targetSdkVersion(28)
        versionCode = 1
        versionName = "1.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }
    buildTypes {
        getByName("release") {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
}

dependencies {
    implementation(fileTree(mapOf("dir" to "libs", "include" to listOf("*.jar"))))
    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk7:1.3.21")
    implementation("androidx.appcompat:appcompat:1.1.0-alpha02")
    implementation("androidx.core:core-ktx:1.1.0-alpha04")
    implementation("androidx.constraintlayout:constraintlayout:1.1.3")
    testImplementation("junit:junit:4.12")
    androidTestImplementation("androidx.test:runner:1.1.2-alpha01")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.1.2-alpha01")
}
```

これで Kotlin DSL 化は完了です、お疲れ様でした。

# buildSrc(おまけ)
Dependenciesの管理って皆さんどうされていますか？

さっき書いてた様に直書きだったり、Gradle Extra Properties を使っておられる方が多いんじゃないかなと思います。しかし、最近は buildSrc と呼ばれる方法があります。折角 Kotlin DSL を導入したついでに、buildSrc も使ってみましょう。

## 何が美味しいのか
buildSrc は **Kotlin で Dependencies を管理する** というものです。専用のモジュールを作成し、そこに `object` を利用して Dependency を定義していきます。これによって Gradle Script 内で Dependency の入力が補完されたり、各 Dependency を管理しやすくなります。しかし、個人規模の開発だと恩恵を受けにくいので、おまけとして紹介させていただきます。

## 導入
まずはルート直下に `buildSrc` というディレクトリ（`Module` ではなく `Directory`）を作成します。そしたら `/buildSrc` の下に `build.gradle.kts` を作成します。

```kotlin
// FilePath: /buildSrc/build.gradle.kts
plugins {
    `kotlin-dsl`
}

repositories {
    jcenter()
}
```

これで準備完了です。 Build をする際、Gradle が `buildSrc` という名前のディレクトリを見つけると自動的に `buildSrc` が使われていると認識し、勝手によしなにしてくれるので、これ以外の設定は必要ありません。この時点で Sync するとディレクトリのアイコンにコップがつくと思います。

あとは Dependencies を記述するファイルを作成します。`/buildSrc/src/main/java/Dependencies.kt` を作成します。ファイルを作成する際、`hoge/fuga.kt` とすると `hoge` ディレクトリが生成され、その下に `fuga.kt` が生成されます。

`Dependencies.kt` には、名前の通り `Dependency` を書いていきます。

どういった基準で分けるかは各開発者やチームの考え方にもよると思うので、あくまで一例として。

```kotlin
object Dependencies {

    object Kotlin {
        const val stdLib = "org.jetbrains.kotlin:kotlin-stdlib-jdk7:1.3.21"
    }

    object AndroidX {
        const val appCompat = "androidx.appcompat:appcompat:1.1.0-alpha02"
        const val ktx = "androidx.core:core-ktx:1.1.0-alpha04"
        const val constraintLayout = "androidx.constraintlayout:constraintlayout:1.1.3"

        object Test {
            const val runner = "androidx.test:runner:1.1.2-alpha01"
            const val espresso = "androidx.test.espresso:espresso-core:3.1.2-alpha01"
        }
    }

    object Test {
        const val jUnit = "junit:junit:4.12"
    }
}
```

あとはこれを `app/build.gradle.kts` から呼び出します。書いているときに補完ができたら成功です。

```kotlin
dependencies {
    implementation(fileTree(mapOf("dir" to "libs", "include" to listOf("*.jar"))))
    implementation(Dependencies.Kotlin.stdLib)
    implementation(Dependencies.AndroidX.appCompat)
    implementation(Dependencies.AndroidX.ktx)
    implementation(Dependencies.AndroidX.constraintLayout)
    testImplementation(Dependencies.Test.jUnit)
    androidTestImplementation(Dependencies.AndroidX.Test.runner)
    androidTestImplementation(Dependencies.AndroidX.Test.espresso)
}
```

かなり読みにくくなりましたね。個人的に buildSrc を導入する利点は、`dependencies` が見やすくなることが1番だと思っています。確かに補完ができたり、 Syntax highlight が効いたりしますが、正直 Kotlin で書き直す労力に見合ってるとは感じません。(少なくともこの規模では。)ですが、`dependencies` を見たときに、何のライブラリが入っているのかがぱぱっとわかるのはとても嬉しいことです。

ついでにバージョンの方も Kotlin で定義しておきます。

`Dependencies.kt` と同じ階層に `Versions.kt` を作成します。

```kotlin
object Versions {
    const val kotlin = "1.3.21"
    const val gradlePlugin = "3.3.1"

    const val compileSdk = 28
    const val targetSdk = 28
    const val minSdk = 21

    const val code = 1
    const val name = "1.0"
}
```

後はそれを各 `build.gradle.kts` に反映させていくだけ。

```kotlin
// FilePath: /build.gradle.kts

buildscript {
    repositories {
        google()
        jcenter()
    }
    dependencies {
        classpath("com.android.tools.build:gradle:${Versions.gradlePlugin}")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:${Versions.kotlin}")
    }
}

allprojects {
    repositories {
        google()
        jcenter()
    }
}

tasks.register("clean", Delete::class.java) {
    delete(rootProject.buildDir)
}
```

```kotlin
// FilePath: /app/build.gradle.kts

plugins {
    id("com.android.application")
    kotlin("android")
    kotlin("android.extensions")
}

android {
    compileSdkVersion(Versions.compileSdk)
    defaultConfig {
        applicationId = "net.oldbigbuddha.sample.samplekotlindsl"
        minSdkVersion(Versions.minSdk)
        targetSdkVersion(Versions.targetSdk)
        versionCode = Versions.code
        versionName = Versions.name
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }
    buildTypes {
        getByName("release") {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
}

dependencies {
    implementation(fileTree(mapOf("dir" to "libs", "include" to listOf("*.jar"))))
    implementation(Dependencies.Kotlin.stdLib)
    implementation(Dependencies.AndroidX.appCompat)
    implementation(Dependencies.AndroidX.ktx)
    implementation(Dependencies.AndroidX.constraintLayout)
    testImplementation(Dependencies.Test.jUnit)
    androidTestImplementation(Dependencies.AndroidX.Test.runner)
    androidTestImplementation(Dependencies.AndroidX.Test.espresso)
}
```

DroidKaigi 2019の公式アプリ内で [面白いバージョンネーム生成を実装していた](https://github.com/OldBigBuddha/conference-app-2019/blob/master/buildSrc/src/main/java/dependencies/Versions.kt) ので一度見られることをオススメします。

正直バージョンを別 object にする必要はあるのかときかれると難しいところがありますが、今回はこんなこともできるよということで。

実際僕が buildSrc 使うときはいかのような書き方をしてます。例に使っているのは [Fuel](https://github.com/kittinunf/Fuel) です。

```kotlin
object Fuel {
    private const val version = "2.0.1"
    const val core = "com.github.kittinunf.fuel:fuel:${version}"
    const val android = "com.github.kittinunf.fuel:fuel-android:${version}"
    const val coroutines = "com.github.kittinunf.fuel:fuel-coroutines:${version}"
    const val serialization = "com.github.kittinunf.fuel:fuel-kotlinx-serialization:${version}"
}
```

バージョン単体をを外に出すのではなく、`object` 内でのみ使いまわせる変数にする感じです。別ファイルにする場合は今回の例のように Kotlin のバージョンみたいに根本のバージョンに限ったほうがいいかなと思います。

# 締め
これで無事 Kotlin DSL を導入でき、ついでに buildSrc も導入できました。お疲れ様です。

Gradle Script はプロジェクトを支えている部分なので、ちょっとミスるとすぐ真っ赤になったり補完が効かなくなったりで非常に鬱陶しい部分ではあります。しかも人によってはあまり効果を感じないという。

僕自身趣味の開発に導入を始めて、めっちゃ恩恵を感じることはないです。(全てKotlinでかけてる感じや、ナウいものを触れてる優越感はありますが…)

導入するにあたって3日ぐらい溶かしたので、僕がつまったところを中心に Step by Step で導入を紹介させていただきました。この記事が、皆さんの手助けになれば幸いです。

最後のもう一度GitHubとTwitterのリンクを貼っておきます。

- GitHub: [OldBigBuddha/sample-kotlin-dsl: まっさらな新規プロジェクトにKotlin DSLを導入したやつ。](https://github.com/OldBigBuddha/sample-kotlin-dsl)
- Twitter: [＠OJI_1941](https://twitter.com/OJI_1941)