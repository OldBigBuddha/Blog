---
title: 何も考えずにGitでaddしてcommitしてpushしてるだけのあなたへ
date: 2018-11-16 00:00:00
category: technology
tags:
  - git
---
この記事は[Life is Tech ! Advent Calendar 2018 - Adventar](https://adventar.org/calendars/3003)1日目の記事です

皆さん、Git使ってますか？Git!

バージョン管理システムとして今最もポピュラーと言っても過言ではないツールです(弊ブログをGitを使って管理しています)。

でも、正直Git使いだしてすぐって何も考えずに`git add -A`して`git commit -m "hogehoge~"`ってして、`git push`してますよね？(僕はそうでした)

そんなあなたに実はこのコマンドはこういう動作をしているんだよ、っていうのを紹介できたらと思います。

# 各コマンドの意味
GitHubやGitLabなどでRepositoryを作成したあと、まず最初に以下のコマンドを打つと思います

```
git init
git add -A
git commit -m "Commit message"
git remote add origin {Repository URL}
git push -u origin master
```

これらのコマンドが何をやっているのか、ご存知ですか？

## git init
コマンドの通り、初期化(initialize)をしています。

`git init`によって、このディレクトリはGitで管理をするために色々下準備をしてくれます(`.git`という隠しディレクトリができて、そこに色々情報が追加されていきます)。

## git add -A
Gitにはインデックスという、「どのファイルを管理対象にするか」を記録するエリアがあります。そこにファイルやフォルダを追加(add)するためのコマンドです。

いくらファイルを編集しても、`git add`をしなくては編集内容がインデックスに反映されず、`git commit`をしても編集されていないと怒られてしまいます。

`git add .`を使うのか`git add -u`を使うのか`git add -A`を使うのかについては[こちら](https://qiita.com/YusukeHigaki/items/06e38eec96387d408780)が参考になります(個人的には面倒くさいので`git add -A`を使ってます)。

## git commit -m "Commit message"
Gitを利用するにあたって、最重要と言ってもいいコマンドです(個人の感想)。

コミット(Commit)という概念がGitでは非常に重要です。

コミットとは、ディレクトリやファイルの追加・変更・削除等を記録したひとかたまりのことをいいます。

別の言い方をすると、`git add`でインデックスに追加された変更をログとして記録しているものです。

`git commit`をした時点の最新インデックスと、一つ前のcommitを比較し、変更点を記録します。

このcommitを元に、過去のある時点の状態に戻したりすることができるのです。

各commitには、メッセージ(メモ的なもの)を付与することができます。

commitにはIDが自動的に付与されるのですが、それを見ただけでは当然変更点はわかりません。また、差分(ファイルの変更箇所)を確認することができても、その差分が一体何を意味しているのかをひと目見て把握することは非常に困難です。

何か不具合が見つかり過去のcommitに状態を戻すときなど、過去のcommitを見返したときにメッセージを見て大まかに把握できるようにしましょう。

わかりやすいcommitメッセージを書くコツは「定型的で簡潔」に書くことです。

実際にどのようにどんな単語を使って書けばいいのかは[こちら](https://qiita.com/itosho/items/9565c6ad2ffc24c09364)の記事がよくまとまっていますので、一度目を通しておくことをオススメします。最初のうちは理由や説明を書くのがの難しいと思うので、一行目の概要を書くだけで十分だと思います。

## git remote add origin {Repository URL}
このコマンドは普通最初以外出てこないので、ほぼ「魔法の呪文」みたく丸暗記している方も多いと思います。

しかし、このコマンドはGitをネットワーク上で管理するのに不可欠なコマンドであり、軽く見ているといつか痛い目にあいます。

Gitでは、管理する一つの塊をRepositoryといいます。

そのRepositoryはもちろんローカルだけで管理することもできますが、それをネットワーク上にアップロードして、リモートで管理することもできます。

本来、ネットワーク上でRepositoryを管理するにはそれ用の鯖が必要ですが、GitHubであったらGitLabであったりBitBucketsであったりが __無償__ でRepositoryを保存する領域を提供してくれています(ありがたや)。

その __リモート先のURLを情報として追加するためのコマンド__ が`git remote add`です。

URLの前に`origin`とあります、これは一体何者でしょうか？

`origin`の位置に指定する単語は、Remote Repository URLを格納する __変数名__ です。(毎回URLを入力するのは面倒くさいですからね)

ぜひ実験用Repositoryを用意して、URLを追加するときに`origin`以外の単語を入れてみてください。

`git push -u origin master`の`origin`を指定した単語に置き換えて実行すれば、問題なく普段通りの動作をします。

慣習的に`origin`を指定しています。

# git push -u origin master
さぁ、ようやく最後のコマンドです。

~~説明が長いので書きたくない~~ ラスト頑張っていきましょう!

先程commitのお話をしました。(いまいちしっくりこないって方は[こちら](https://backlog.com/ja/git-tutorial/intro/intro1_3.html)を見るなりググるなりしてください)

そしてネットワーク上にRepositoryを保存できるというお話もいたしました。

ローカルで作成したcommitをRemote Repositoryに反映させるには、コマンドを打ち込んで、しっかりネットワーク上のRipositoryにcommitを伝えてあげないといけません

Remote Repositoryに最新のcommitを反映させるコマンドが`git push`になります。

ここまでがよくきくGitの一連の流れ(解説付き)です。

が、折角の冬(?)なのでもう一歩踏み込んだ世界を見てみましょう。

## Branch(ブランチ)
`git push -u origin master`を見たときに、`git push`や`origin`は理解できたけど`master`ってなんやねん、`u`オプションはなにを意味するんやという疑問が出てきます。

~~面倒くさいので~~長くなるので簡単に話しますね。

最新のcommitを指すポインタ的なものがHEADです。

HEADをみたら最新のcommitのことなんだなと思いましょう。

そして、あるcommitを指す変数を __branch__ といいます。

`master`はGitが最初から用意しているbranchです。

branchはいくつでも作ることができます。

試しに`git branch hoge`としてbranchを作成してみましょう。

`git branch`とすることで今ローカルにあるbranchが確認できます。

```
$ git branch hoge
$ git branch
  hoge
* master
```
*がついているのが現在のbranchです。

現在のbranchが指しているcommitをRemote RepositoryへPushします。

だから`git push origin master`なのです。

branchを切り替えるには`git checkout hoge`とします

```
$ git checkout hoge
Switched to branch 'hoge'
$ git branch
* hoge
  master
```

branchを変えると何がおいしいのでしょう？

例えば`hoge`でファイルAを追加して何か編集して、commitを作成します。

その後に`master`へ戻ると、さきほど作成・編集をしたファイルAが消えてます。

なぜなら、`master`はファイルAに関するcommitを作成する前のcommitを指しているからです。

`master`が指しているcommitにはファイルAの存在自体がないので、切り替えたら消えるというのは当然といえば当然です。

`hoge`の内容を`master`に反映させるにはどうすればよいのでしょうか？

`git merge hoge`というふうにすれば解決です。

このコマンドは、`hoge`を作成した(`master`から分岐させた)ときから、`hoge`が指してきたcommit達を`master`に取り込む(マージ)コマンドです。

`git merge hoge`を行うとき、まずgitは`master`が指しているcommitと`hoge`が指しているcommitを比較したあと、色々整合させるための処理をして、 __ひとつのcommit__ を作成します。

mergeをしたときに作成されたcommitを __merge commit__ と呼びます。

そして、mergeが完了したらRemote RepositoryへPushしてあげましょう。

当然別々の歴史を持っているので、同じ箇所を編集してしまっていたということもあるでしょう。同じ箇所を編集していて、mergeできない状態を __conflictを起こした__ といいます。

conflictが起こった場合は、その部分を手動で修正し、`git add`でインデックスに編集内容を追加します。

その後、commitを作成します。conflictを起こすと、Gitはmerge commitを作成してくれません(エラー状態なので当たり前ですよね)。

あとはそのcommitをPushして終了です。

# 最後に
開発をやっていく上で、Gitは非常に強力なツールとして積極的に活用していくと思います。

しかし、その強力さ故に理解するのに非常に時間がかかります。

まずは以下のサイトを一通り流し読みされることをオススメします。日本語なので言語的には不自由なく読めます。通学・通勤中だったり~~授業中だったり~~趣味の時間だったりに少しずつ読んでいくと思います。

[Git - Book](https://git-scm.com/book/ja/v2)
