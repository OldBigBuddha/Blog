---
title: NetlifyとCloudFlareを併用しているときに気をつけたいこと
date: 2018-12-17 21:28:28
tags:
  - [Netlify]
  - [CloudFlare]
  - [CDN]
---
先日、偶然以下の記事を読んだ。

[CDNってそもそも何？なんかサーバの負荷が下がるって聞いたんだけど！〜Web制作/運営の幅が広がるCDNを知ろう第1回〜 | さくらのナレッジ](https://knowledge.sakura.ad.jp/19191/)

弊BlogはDNSに[CloudFlare](https://www.cloudflare.com/)を、ホスティングサービスとして[Netlify](https://www.netlify.com/)を利用している。最近の静的サイトにこういう構成は増えてきたのではないのだろうかと勝手に思っている。

それまでCDNというのは何か使っとけば高速化されるもので、とりあえずよくわからんけど使ってみようという感じで使っていた。

しかし、上記の記事を読んで何も考えずにこの2つを併用していると本来発揮できるパフォーマンスの半分ぐらいしか出なくなることに気がついた。

実際に調べてわかったこと、対策したことを記しておく。(マサカリ待ってます: [@OJI_1941](https://twitter.com/OJI_1941))

# そもそもCDNってなんぞ
Content Delivery Network(CDN)はその名の通りコンテンツを配信してくれるネットワーク(サーバ群)のこと。

[こちらの記事](https://knowledge.sakura.ad.jp/7085/)では、以下のように紹介されている。

> CDNとはContent Delivery Networkの略で、簡単に言うと自分のサーバーの代わりにデータの配信を肩代わりしてくれるサーバーの集合体です。

「オリジンサーバ」上にあるコンテンツを「キャッシュサーバ」でキャッシュし、**「オリジンサーバ」への負荷を軽減**し、かつ**高速でコンテンツを配信**することに重点を置いている技術。弊Blogの場合、ホスティングはサービスを利用しているので「**高速でコンテンツを配信する**」できるかが最重要項目である。

# 問題点
今回の問題は、**CloudFlareもNetlifyもCDNを提供している**ということである。

つまり2重のCDNが生成されてしまい、期待しているスピードがでないという可能性がある。実際に計測したわけではないが、そんな気がする。

# 解決策
CloudFlareのCDN機能を停止すればよい。

調べてみたところ、すでに[記事にされている](https://jaketrent.com/post/cloudflare-dns-netlify-host/)方がいる。

今回はその記事を参考にして設定をしていく。

Cloud Flareにログインし、 `DNS` タブを開く。

登録しているレコード欄の一番右端にオレンジ色の雲があるので、対象となるレコードの雲をクリックして灰色に変える。灰色になると、CloudFlareのプロキシを通らなくなるので、CDN機能が解除される。

![Screenshot](https://res.cloudinary.com/simpleisbest/image/upload/v1545143962/Screenshot_from_2018-12-18_16-38-45.png)

これで万事解決かと思ったが、そうでもなかった。

CloudFlareのプロキシを使うと自動的にSSL証明書がついてくるのだが、そのプロキシを無効化しているのでSSL証明書が消える。

代わりにNetflify経由でLet's EncryptのSSL証明書を取得する。

![Screenshot](https://res.cloudinary.com/simpleisbest/image/upload/v1545144349/Screenshot_from_2018-12-18_16-45-24.png)

"Verify DNS configuration"をクリックするとDNSの設定が正しいかチェックされる。問題なければSSL証明書が発行され、SSL通信が可能となる。

証明書はNetlifyが自動更新をしてくれるため、有効期限が切れてしまってどうしようなんてことがなくなる。

これでCloudFlare・Netlify、両方の恩恵を受けつつBlogを運営していくことができる。

多少制限があるとは言え、ここまで無料でできるというのはなかなか凄い世の中である。