---
title: GitHubのIssueとAsanaを同期させる
date: 2019-03-21
tags:
- [GitHub]
- [Asana]
code: false
---
最近、Task 管理に [Asana](https://asana.com/) を使うようになりました。そのついでで GitHub の Issue も Asana 側で管理できないかなと思ったらどうやらいけそうなのでやってみます。

## 方法

どうやら [Unito](https://unito.io/) というサービスがあり、それを使えば同期できるそうです。

Unito は様々な課題管理サービスを同期させるためのサービスです。Asana と GitHub 以外に Jira や Wrike、Trello なども対応しているようです。詳しくは[こちら](https://guide.unito.io/hc/en-us/articles/224549548-The-Basics)をご覧ください。

## やってみた

方法がわかったところでやってみます。とりあえず Asana と GitHub それぞれに同期する Project、Repository を作成します。今回は [弊Blogのリポジトリ](https://github.com/OldBigBuddha/Blog) と、その Issue を同期させるための Project を利用します。

まずは Asana で Team と Project を作成して…

![AsanaのTeamを作成](https://res.cloudinary.com/simpleisbest/image/upload/q_auto:good/v1553192150/GitHub%E3%81%AEIssue%E3%81%A8Asana%E3%82%92%E5%90%8C%E6%9C%9F%E3%81%95%E3%81%9B%E3%82%8B/Create-Asana-Team.webp)

![Projectを作成](https://res.cloudinary.com/simpleisbest/image/upload/q_auto:good/v1553192314/GitHub%E3%81%AEIssue%E3%81%A8Asana%E3%82%92%E5%90%8C%E6%9C%9F%E3%81%95%E3%81%9B%E3%82%8B/Create-Asana-Project.webp)

![Home画面](https://res.cloudinary.com/simpleisbest/image/upload/c_scale,q_auto:good,w_800/v1553192354/GitHub%E3%81%AEIssue%E3%81%A8Asana%E3%82%92%E5%90%8C%E6%9C%9F%E3%81%95%E3%81%9B%E3%82%8B/Asana-Project-Home.webp)

次に Unito にログインして Sync の設定をしていきます。アカウントは各サービスのアカウントで作成できます。自分が利用予定(今回は GitHub か Asana)でログインしておきます。あとでもう一方のアカウントも紐付けといてください。

![Unitoにアクセスしてすぐの画面](https://res.cloudinary.com/simpleisbest/image/upload/c_scale,q_auto:good,w_800/v1553193168/GitHub%E3%81%AEIssue%E3%81%A8Asana%E3%82%92%E5%90%8C%E6%9C%9F%E3%81%95%E3%81%9B%E3%82%8B/Unito-Home.webp)

ログインに成功すると以下のようなヘッダーになり、もし他の同期を設定していたら真ん中に表示されます。(既にいくつか設定があるので上だけ。)

![ログイン後の画面](https://res.cloudinary.com/simpleisbest/image/upload/c_scale,q_auto:good,w_800/v1553193217/GitHub%E3%81%AEIssue%E3%81%A8Asana%E3%82%92%E5%90%8C%E6%9C%9F%E3%81%95%E3%81%9B%E3%82%8B/Unito-Logined.webp)

右上の `Add Sync` をクリックして同期を設定します。一番上の `Mirror-sync` を選択して `Next`。

![Sync作成画面1](https://res.cloudinary.com/simpleisbest/image/upload/c_scale,q_auto:good,w_800/v1553193279/GitHub%E3%81%AEIssue%E3%81%A8Asana%E3%82%92%E5%90%8C%E6%9C%9F%E3%81%95%E3%81%9B%E3%82%8B/Unito-Create-1.webp)

続いて同期させたいサービスと Project、Repository を選択します。今回は双方反映なので左右を気にする必要はありません。

![Sync作成画面2](https://res.cloudinary.com/simpleisbest/image/upload/c_scale,q_auto:good,w_800/v1553194389/GitHub%E3%81%AEIssue%E3%81%A8Asana%E3%82%92%E5%90%8C%E6%9C%9F%E3%81%95%E3%81%9B%E3%82%8B/Unito-Create-2.webp)

今の状態では Issue だけではなく PR も同期されてしまうので、Issue のみにするフィルタを作成します。集団で利用している場合、自分がアサインされているものだけを同期するなんてことも出来ます。Closed されたものも同期するか否かが設定できるのは便利ですね。

![Sync作成画面3](https://res.cloudinary.com/simpleisbest/image/upload/c_scale,q_auto:good,w_800/v1553193352/GitHub%E3%81%AEIssue%E3%81%A8Asana%E3%82%92%E5%90%8C%E6%9C%9F%E3%81%95%E3%81%9B%E3%82%8B/Unito-Create-3.webp)

最後に真ん中の矢印が双方向になっているか、左右に登録しているものが同期させたいものかを確認して `Create Sync` をクリックします。

![Sync確認画面](https://res.cloudinary.com/simpleisbest/image/upload/c_scale,q_auto:good,w_800/v1553193431/GitHub%E3%81%AEIssue%E3%81%A8Asana%E3%82%92%E5%90%8C%E6%9C%9F%E3%81%95%E3%81%9B%E3%82%8B/Unito-Create-last.webp)

作成が成功すると先ほどのホーム画面が表示され、作成した Sync が表示されます。同期の停止や設定の変更はいつでもこの画面からできます。

![ホーム画面に作成したSyncが表示されている](https://res.cloudinary.com/simpleisbest/image/upload/c_scale,q_auto:good,w_800/v1553193480/GitHub%E3%81%AEIssue%E3%81%A8Asana%E3%82%92%E5%90%8C%E6%9C%9F%E3%81%95%E3%81%9B%E3%82%8B/Unito-check-sync.webp)

最後に Asana 側でしっかり同期されているかを確認します。

![Asanaで同期されているのが確認できる](https://res.cloudinary.com/simpleisbest/image/upload/q_auto:good/v1553193528/GitHub%E3%81%AEIssue%E3%81%A8Asana%E3%82%92%E5%90%8C%E6%9C%9F%E3%81%95%E3%81%9B%E3%82%8B/Asana-sync-issues.webp)

無事 Closed を含めて反映されていますね。これでめでたしめでたし。

## 所感

ちょっと前まで Task などは Issue で管理をしていたのですが、最近やっているプロジェクトで Asana を使ってみたら予想以上に使いやすかったので一気に引っ越しを始めました。それでも commit や PR に Task として登録しておいた Issue を紐付けたいなと思って色々探していたらこの方法にたどり着きました。Asana のタグと Issue のラベルが同期できるかは把握してません(多分できる…？)。また気が向いたら調べてみます。
