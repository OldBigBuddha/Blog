---
title: SPF と DKIM と DMARC
code: true
date: 2020-07-10
tags:
  - [セキュリティ]
---

去年の今頃ぐらいに自分のメールに送信ドメイン認証技術と DMARC 設定をしたのですが、実はしっかり理解できてなかったり DMARC のレポートの読み方を知らなかったりしてたので、今更ですが調べてまとめておきます。あくまでも素人が調べてまとめた記事ですので、詳しいことはご自身でお調べください。本記事の最後に参考文献をまとめおきます。もし明らかな勘違い等が書かれていたら [@OldBigBuddha](https://twitter.com/OldBigBuddha) にお知らせいただけると幸いです。

本記事は、個人で GSuite を契約したメールアドレスに **SPF・DKIM・DMARC** を設定した人間がまとめています。細かいところは利用するサービスによって変わると思うのでそこらへんご留意ください。なお、SPF や DKIM がしっかり登録できているかどうかは [Google のツール](https://toolbox.googleapps.com/apps/checkmx/) を用いることによって確認することができます。僕のドメイン（`oldbigbuddha.net`）はすべて設定しているので、ツールの挙動を確認されたい場合はご利用ください。

## なりすましメールと送信ドメイン認証技術

メールの差出人データを改ざんしてあたかも他人が送信したかのように見せかけた「なりすましメール」というものがあります。これはメールの仕様上、送信元（From）を送信者側で書き換えることができるからです。例えば僕が誰かにメールを送信する際に、送信元のアドレス情報（ヘッダーFrom）をネットバンクAのアドレスにすることで、受信者側は「このメールはネットバンクAから送られたメールだ」と勘違いしてしまいます。最近ではこういった銀行や取引先になりすましたメールを用いて個人情報などを抜き取る事件というものが増えています。

このようななりすましメールを見破るために用いる技術が **送信ドメイン認証技術** と呼ばれるものです。この技術を用いると、送信元が本物なのかを受信側が判断できるようになります。具体的には以下で説明する SPF と DKIM というものがあります。他にも SenderID（普及しなかった SPF v2）や DomainKey（DKIM の前身）などがありますが、今は SPF/DKIM を知っておけば大丈夫かなと言う認識です。

### SPF（Sender Policy Framework）

SPF（Sender Policy Framework、[RFC7208](https://tools.ietf.org/html/rfc7208)）は DNS の TXT レコードに送信元の IP アドレスを指定することによって送信元のサーバが正しいかを確認できます。なりすましメールはあくまでヘッダー From を書き換えただけで、メールサーバを乗っ取ったわけではないため、登録されている IP アドレスとは異なっています。ひと昔前は SPF レコードがありましたが、その後の仕様更新によって TXT レコードが利用されるようになりました。

どうやらガラケー全盛期に大手キャリアが SPF 判定を実装したことによって日本での普及率は世界的に見ても少し高めのようです。もし個人でメールを運営される際は必ず設定しておきたいですね。

GSuite の場合は TXT レコードに `v=spf1 include:_spf.google.com ~all` という値を設定しました。こうすることによって Google のメールサーバが登録されます。メールサーバを追加する場合は `~all` の手前に `ip4:[アドレス]`、`ip6:[アドレス]`、`include:[ドメイン]`などを追加します。詳しくは [GSuite 管理者ヘルプ](https://support.google.com/a/answer/33786) でご確認ください。

SPF を設定する上でひとつ注意すべきことがあります。それは「機械的な転送」です。自動的な転送やメーリングリストのようにメールを受け取った際に送信者情報をそのままにして別の受信者に転送する場合、SPF に登録されているメールサーバと違うサーバから送られたと認識されてスパム判定を食らってしまいます。メールを転送する場合は送信者情報を適切に書き換えましょう。

### DKIM（DomainKeys Identified Mail）

DKIM（DomainKeys Identified Mail、[RFC6376](https://tools.ietf.org/html/rfc6376)）は公開鍵認証を利用したプロトコルです。メールサーバ上で送信するメールヘッダーに電子署名を付与し、検証用の公開鍵を DNS に登録することによってなりすましを発見できるようにします。SPF よりも確実性が高いですが、受信側の普及率が低いということが難点です。

DKIM を設定するには TXT レコードにメールサーバで設定した公開鍵を設定します。GSuite では管理コンソールの `Gmail` から確認できます。詳しくは [こちら](https://support.google.com/a/answer/180504?hl=ja) をご確認ください。

## 送信ドメイン認証技術と DMARC

SPF や DKIM と同じタイミングで出てくるのが DMARC（Domain-based Message Authentication, Reporting, and Conformance、[RFC7489](https://tools.ietf.org/html/rfc7489)）です。DMARC はなりすましメールを見つけるためではなく、見つけた場合に受信側がどういう挙動をするべきか、一体誰が自分になりすましているのかのレポートをどこに送るのかなどを決めるプロトコルです。なので、「送信ドメイン認証技術（SFP/DKIM）＋ DMARC」という組み合わせが今風のなりすまし対策と言えます。

DMARC を設定する場合は TXT レコード名を `_dmarc` とし、値には以下の書式で設定します。

`v=DMARC1; p=<policy>; rua=mailto:<address>;`

他にもプロパティがありますがまずはこれだけ把握しておけばいいと思います。ドメイン認証に失敗したメールをどう扱うかを指示する `p=<policy>` に設定できる値は3つあります。

- `none`: 何もしない
- `quarantine`: 隔離する（迷惑メールに振り分ける）
- `reject`: 拒否する（送信サーバには受信サーバから不達通知がいきます）

次にある `rua=mailto:<address>;` はオプショナルではありますがレポートは大切なので設定しておきましょう。DNS に登録する都合上日常的に使うアドレスは避けるようにします。僕は `abuse@oldbigbuddha.net` を登録しています。どういう名前を使うかは [RFC2142](https://tools.ietf.org/html/rfc2142) で定義があるのでぜひ一度ご覧ください。NIC が [日本語訳](https://www.nic.ad.jp/ja/translation/rfc/2142.html) を公開しています。

DMARC は段階的に導入することが推奨されています。次のセクションで説明するレポートを見つつポリシーを変更していってください。[段階的な導入の具体例](https://support.google.com/a/answer/2466563) を Google が解説しているので気になる方はご覧ください。

## DMARC のレポート

最後に DMARC のレポートを具体例を出して紹介します。以下のレポートは実際に私が受信しているレポートです。IP アドレスの部分は一応伏せています。Google のメールサーバだと思うので伏せる必要がないのかもしれませんが…。

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<feedback>
  <report_metadata>
    <org_name>google.com</org_name>
    <email>noreply-dmarc-support@google.com</email>
    <extra_contact_info>https://support.google.com/a/answer/2466580</extra_contact_info>
    <report_id>5028745713173797829</report_id>
    <date_range>
      <begin>1594252800</begin>
      <end>1594339199</end>
    </date_range>
  </report_metadata>
  <policy_published>
    <domain>oldbigbuddha.net</domain>
    <adkim>r</adkim>
    <aspf>s</aspf>
    <p>quarantine</p>
    <sp>quarantine</sp>
    <pct>100</pct>
  </policy_published>
  <record>
    <row>
      <source_ip>209.***.***.***</source_ip>
      <count>2</count>
      <policy_evaluated>
        <disposition>none</disposition>
        <dkim>pass</dkim>
        <spf>pass</spf>
      </policy_evaluated>
    </row>
    <identifiers>
      <header_from>oldbigbuddha.net</header_from>
    </identifiers>
    <auth_results>
      <dkim>
        <domain>oldbigbuddha.net</domain>
        <result>pass</result>
        <selector>google</selector>
      </dkim>
      <spf>
        <domain>oldbigbuddha.net</domain>
        <result>pass</result>
      </spf>
    </auth_results>
  </record>
</feedback>

```

`report_metadata` にはレポートを送信した団体の情報等が含まれており、`policy_published` には適用されたポリシー等が表示されています。その後の `record` がメールそのものに関する情報です。ここでは `209.***.***.***` から出た2通のメールが SPF/DKIM 共に pass したことが分かります。このレポートが来た前日に `oldbigbuddha.net` のなりすましメールはなかったということですね。

## まとめ

自分でメールを運用される方は最低限 SPF/DKIM/DMARC を設定してなりすましメールによる被害を減らす努力をしたほうが良いですね。設定をするための手間もそんなにありません。

設定した当時はネットの情報をそのままコピペしただけでしたが、今回を機にいろいろなプロパティを知ったので僕の設定も変えていこうと思います。また、これまで DMARC のレポートを全然見てこなかったのですが、今後は GAS とか使って良い感じにまとめていこうと思います。

## 参考文献

本記事を書くにあたり以下の記事を参考にしました。

- [送信ドメイン認証（SPF / DKIM / DMARC）の仕組みと、なりすましメール対策への活用法を徹底解説 - エンタープライズIT](https://ent.iij.ad.jp/articles/172/)
- [送信ドメイン認証技術（SPF、DKIM ）やDMARCとはどのような仕組みか？ - メールマーケティングのCuenote](https://www.cuenote.jp/library/marketing/dmarc.html)
- [送信ドメイン認証について - infomani@](http://www.infomania.co.jp/techinfo/domainkeys.html)
- [DMARCとは？送信ドメイン認証の仕組みを理解して、なりすまし対策をしよう！ - メルラボ](https://mailmarketinglab.jp/about-dmarc/)
- [どれくらい自社ドメインがなりすまされているか、ご存知ですか? − IIJ Engineers Blog](https://eng-blog.iij.ad.jp/archives/3273)
- [世界と日本のメール送信ドメイン認証 - IIJ Engineers Blog](https://eng-blog.iij.ad.jp/archives/1234)