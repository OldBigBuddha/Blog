---
title: JAMstackなBlogを作った話
date: 2018-12-25
tags:
  - [JAMstack]
  - [Netlify]
code: true
---
この記事は[JAMstack Advent Calendar 2018](https://qiita.com/advent-calendar/2018/jamstack)25日目の記事です。

ついに ~~魔の~~ アドカレ期間も最終日を迎えました。皆さん如何お過ごしでしょうか？

僕は今年だけで8本ほど請け負っていたのですが、なかなかしんどかったです。来年は自重して10本ぐらいに抑えようと思います。

そんなアドカレ参加に必須とも言えるBlog、今年のアドベントカレンダーに合わせて新調しました。そこに至るまでの流れや、実際にしたことなどを本題のJAMstackを絡めながらお伝えしていければと思っています。

# JAMstackとは？
JAMstackとは、[Netlify](https://www.netlify.com/) の創設者である [Mathias Biilmann](https://twitter.com/biilmann) が2016年頃に提唱した新しいFront-end Stackです。[こちら](https://speakerdeck.com/biilmann/the-jam-stack) でご本人によるスライドを見ることができます。

特徴としては、**J**avaScript・**A**PIs・**M**arkup を中心に利用するということです。JAMstackを利用することで、フロントエンドとバックエンドを明確に分けることができるため、フロントを直すだけなのにバックのコードにまで影響を与えてしまうと言った不要な心配をしなくてよくなります。

詳しくは以下のサイトをご覧ください。

[JAMstack | JavaScript, APIs, and Markup](https://jamstack.org/)

# 利用したもの
本題のBlog構築についてです。以下に記述しているものは、弊Blogを作成する為に利用したものです。(2018年12月現在の情報)

- [Hexo](https://hexo.io/): 静的サイトジェネレーター
- [Netlify](https://www.netlify.com/): 静的サイトのホスティグサービス、言い出しっぺだけあってJAMstackにやさしい機能がたくさんある
- [CloudFlare](https://www.cloudflare.com/): DNSサービス、めちゃくそ速い
- [GitHub](https://github.com/): 世に言う「設計図共有サイト」、弊Blogの設計図は[こちら](https://github.com/OldBigBuddha/Blog)
- Google [Analytics](https://marketingplatform.google.com/about/analytics/) & [Search Console](https://search.google.com/search-console/about?hl=ja): 言わずとしれたアナリティクス系ツール

下2つは説明不要ですね。Webサイトに限らず、様々な場面で活用しています。

Netlifyの機能については[1日目のnabettuさん](https://blog.nabettu.com/entry/netlify-jamstack)がまとめてらっしゃるのでそちらをご覧ください。

CloudFlareはCDNサービスですが、DNSとしてのサービスも提供しています。利用するだけでCloudFlareのCDNが使えたり、SSL通信してくれたりと非常に優秀な子です。しかし、Netlifyと色々サービスが被ってしまうため、[併用には注意が必要](https://blog.oldbigbuddha.net/post/use-netlify-with-cloudflare-cdn/)です。

Hexoは、Nodejs製の静的サイトジェネレーターです。同じ立ち位置では、[Jenkyll](https://jekyllrb.com/)や[Gatsby](https://www.gatsbyjs.org/)、[Hugo](https://gohugo.io/)などがあります。それぞれ推している言語が違うのが面白いですね。

将来的には[Netlify CMS](https://www.netlifycms.org/)を導入して、記事の投稿だけならネット上だけでできるようにしたいと考えています。

Netlify CMSはNetlifyでホスティングしているWebサイトにCMS機能を追加するサービスです。CMS上で編集した内容は、GitHubにPushされます。詳しく調べていないのですが、[GitLab](https://about.gitlab.com/)や[BitBucket](https://bitbucket.org/product)にも対応しているようです。

# フロー
弊Blogの記事がインターネットに上がるまで、以下のようなフローを経ています。

1. ローカルで記事を作成(MarkDown記法)
2. 記事用のbranchにコミット、GitHubにPush
3. GitHub上でPush内容をリリースブランチ(master)にマージ
4. 公開

フローの細かいことに関しては[こちら](http://bigbuddha.hatenablog.jp/entry/2018/10/15/221327)をご覧ください。

NetlifyにはCI機能があり、GitHubのRepositoryを連携させると勝手にCIを回してくれます。また、masterの内容をそのままNetlifyに投げていますので簡単にmasterへcommitやpushができません。なのでブランチは常に切っています。[Git フック](https://qiita.com/noraworld/items/c562de68a627ae792c6c)を利用して、強制的にcommit/pushを禁止しています。(一回間違えてcommitしかけて助けられたのでオススメ。)

# 個人的に頑張った点
趣味の範囲とは言え、可能な限り高速なBlogを心掛けて作成しています。また、デザインは苦手ですが少しずつ自分色を出せるように日々工夫しています。

その中で得た知見を紹介します。(特に同じ構成を予定されている方に読んで欲しい。)

## HTTP/2のServer Pushを有効にする
[NetlifyはHTTP/2のServer Pushに対応しています。](https://www.netlify.com/blog/2017/07/18/http/2-server-push-on-netlify/)

HTTP/2ってなんぞやって方は[ここ](https://knowledge.sakura.ad.jp/7734/)を読むなりググるなり詳しい人に聞くなりしてください。

この機能を有効にするには、ホストするディレクトリのルートに `_headers` を置かなくてはいけません。しかしながら、Hexoの機能で**アンダースコアから始まるファイルは出力しない**というものがあります。ってことで `_headers` をどこかに置くだけではホスティング用ディレクトリに生成されません。困ったものです。

そこで僕は[Gulp](https://gulpjs.com/)を使いました。GulpはよくSaasのコンパイルやuglifyなどのタスクをまとめて実行するときに利用されます。

幸いなことに、Hexoの `generate` コマンドがGulpに対応していたので、生成した後に用意した `_headers` をホスティングディレクトリのルートにコピーするという風にしました。Netlifyは対象ブランチにpushがあったときに実行するコマンドをある程度決めることができるので、非常にありがたいです。

同じ方法を用いて [`_redirects`](https://www.netlify.com/docs/redirects/) を利用し、常時SSL化もしています。

## Themeをカスタマイズ
Hexoには[たくさんのテーマ](https://hexo.io/themes/index.html)があり、その中から良さげなものを選んで利用します。

テーマのカスタマイズについてはすでに[JavaScript Advent Calendarのmoomooyaさん](https://qiita.com/moomooya/items/f11aac16573b372f9b0f)が非常にわかりやすい記事を書かれていらっしゃるので、そちらをご覧ください。(JAMstackのほうで投稿してほしかった…)

元は似たようなことを書こうと思っていたのですが先に書かれてしまったので、軽く触れるだけにします。

Hexoのテーマはほとんどejs/stylusで書かれています。(Hexoのデフォがこの構成。)

しかし、僕は**Pug**/Stylusが書きたいのです。このことはテーマを選ぶときに非常に重要になります。

もちろんejsのテーマを書き換えてもいいのですが、非常に手間で心が折れるので最初からPugで書かれたテーマを使われることを**強く**オススメします。

どうしてもこれが使いたいんだっていう方はejsとPugの違いがよくまとまっている[こちらの記事](https://qiita.com/otsukayuhi/items/8556b014ea363eabe11f)をご覧ください。あと、Hexoが提供している `partial()` っていう関数は `include` や `mixin` を使ったほうがいいです。

## SNSボタンの設置
この記事の下部にSNSにシェアするためのボタンが設置してあります。Hexo側から提供されるとかはないので、Themeをいじって自分で作りました。

ホバーアニメーションにこだわったので、ぜひマウスをホバーさせてみてください。(ホバーしたついでにクリックして拡散していただけると更に嬉しいです。)

SNSボタンは[こちら](https://wemo.tech/281)を参考にしました。記事の方ではPHPを利用されていますが、ロジックさえわかればどの言語も一緒ということでJSに書き直しました。

## 利用規約や法律的に不利にならないようにする
これはJAMstackには関係ないことですが、Blogを運営する上で非常に重要なことになります。

最初に書いた通り、弊BlogではGoogle Analyticsを利用しています。ブログのPV数って単純に書くことに対するモチベーションになるんですよね。

こちらに移行する前に[はてなブログ](http://bigbuddha.hatenablog.jp/)で書いていたのですが、そのブログは今でも1日30~40PV出してくれます。月間だと1000PVをゆうに超えます。このことはBlogを書くということに対して非常に自信となっています。(現在の環境に移行した理由は、独自ドメインがタダで使いたかった、コンテンツ以外の部分も成果物として紹介できるようにしたかったって感じです。)

今後こちらで記事を書いていくのに、自信となる数字がみたいのでGoogle Analyticsを導入しました。

そのGoogle Analyticsには当然利用規約があり、そこには**必ずプライバシー・ポリシーを記載しなくてくはいけない**という項目があります。(詳しくは[こちらの記事](http://zo-site.com/2018/08/16/blog-seo-privacypolicy/#1Google)をご覧ください。)

そのため、弊Blogでは[プライバシー・ポリシー](https://blog.oldbigbuddha.net/privacypolicy/)を設置しています。

また、弊Blogの写真・文章等ソースコードのコンテンツ以外は全て[CC BY-SA 4.0](https://blog.oldbigbuddha.net/privacypolicy/)というライセンスで公開しています。インターネット上で継続していく場合は、利用者が安心して情報を利用していけるようにライセンスを決めておくべきかなと思います。その際に自作をするのではなく、既存の有名なライセンスを適用したほうが作成者側も手間が減りますし、利用者側も使い方がわかりやすいです。ちなみにソースコードは[Apache License v2](https://www.apache.org/licenses/LICENSE-2.0)が適用されています。

ここらへんの文章を書くのはかなり手間なので後回しにしてしまいがちですが、公開するのであればしっかり準備しておきたいものです。

# 気になっていること
これまで紹介した内容で運営をしているのですが、個人的な悩みが一つあります。それが画像です。

もともとHexoで画像を扱うのに色々方法があってややこしかったり、個人的な意見でGitHubにあまり画像を上げたくないなどあり、色々方法を模索中です。

現在は試験的に[Cloudinary](https://cloudinary.com/)という画像CDNを導入しています。ある程度は無料で使えるので、しばらく使って規模的にヤバそうになってきたら予算と相談しつつ良さげなCDNと契約するなりVPS取ってなんちゃってCDNを構築するなりします

# 今後
弊BlogのInitial commitは2018年11月1日のようです。

かなり新しいですし、12月に入ってからはアドカレで忙しすぎたので実質作成期間は1ヶ月弱です。

これからもっともっとオリジナリティを出したBlogスタイルにしていこうと思っています。

最近ようやくHexoの使い方がなんとなく分かってきたので、pluginのチューニングや自作なども積極的にやっていこうと思っています。

---

それでは皆様、良いお年をお過ごし下さい。