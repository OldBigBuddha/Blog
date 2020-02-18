---
title: Twitter アカウントのアクセストークンを引き抜くスクリプト
date: 2020-01-27
tags:
  - [Python]
  - [Twitter]
code: true
---
個人で開発してるとふとした瞬間に Twitter アカウントのアクセストークンが欲しくなることありますよね。何も知らずに調べてると callback URL が必要だとか書いてあってどうすればいいんじゃとなります。どうやらバックエンドがなくとも Twitter が別の方法を使って連携させる方法を提供してくれてるようなので、それを使います。Twitter やさしい。

とりあえず以下のスクリプトを実行します。[`tweepy`](https://github.com/tweepy/tweepy) が必要なので `pip` とかでインストールしておいてください。あと、API Key とかは自分のものにしておいてください。

```python
import tweepy

consumer_key = '<YOUR KEY>'
consumer_secret = '<YOUR SECRET>'

auth = tweepy.OAuthHandler(consumer_key, consumer_secret)

try:
    redirect_url = auth.get_authorization_url()
    print(redirect_url)
    verifier_pin = input('PIN:')
    auth.get_access_token(verifier=verifier_pin)
    print(auth.access_token)
    print(auth.access_token_secret)
except tweepy.TweepError:
    print('Error! Failed to get request token.')
```

実行すると URL が出力されるので、そこへアクセスします。アクセストークンがほしいアカウントで連携をすると PIN が表示されますので、その PIN をそのままターミナルに貼り付けます。するとほしかったものが手に入ります。以上です。

{% noindent ※コード製作者である私は本スクリプトを実行することによって実行者が得た利益・不利益に対して一切責任を持ちません、ご了承ください。 %}

{% noindent （動作確認は済ませてあります。）%}
