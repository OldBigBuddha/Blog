---
title: DiscordのOAuth認証を使ったみた
date: 2019-12-20
tags:
    - [Python]
    - [OAuth2.0]
    - [DiscordAPI]
code: true
---

この記事は [認証認可技術 Advent Calendar 2019](https://qiita.com/advent-calendar/2019/identity) および [Discord Advent Calendar 2019](https://qiita.com/advent-calendar/2019/discord) 20 日目の記事です。

Python の Flask を使って Discord の OAuth 認証をするための簡易的なアプリケーションを作ります。[`GET /users/@me`](https://discordapp.com/developers/docs/resources/user#get-current-user) を叩いてレスポンスを得るのをゴールとします。

## 下準備

Pipenv 派の人なので Pipenv でプロジェクトディレクトリを作成します。Discord OAuth 認証用の Flask 拡張が存在していますが、OAuth の勉強も兼ねて Flask 単体で実装します。

```command
$ pipenv install --python 3.8
$ pipenv install flask requests
```

それと、callback を用意するために [ngrok](https://ngrok.com/) を使います。

そして [Discord Application](https://discordapp.com/developers/applications) も忘れずに。

## 鯖を書く

準備はできたのでコードを書いていきます。とりあえず全体像はこんな感じ。

```python
from flask import Flask, redirect, request
from flask import json as json_flask
import requests
import json
import configparser
import os

app = Flask(__name__)

def exchange_code(code):
    data = {
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URL,
        'scope': '%20'.join(scope)
    }
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    r = requests.post('https://discordapp.com/api/oauth2/token', data=data, headers=headers)
    print(data)
    r.raise_for_status()
    return r.json()

@app.route('/')
def root():
    return 'Alive Server ...'

@app.route('/login')
def login():
    res_authorize = requests.get(BASE_URL + 'oauth2/authorize', params=authorize_params)
    return redirect(res_authorize.url)

@app.route('/callback')
def callback():
    code = request.args.get('code')
    res_token = exchange_code(code)
    token = res_token['access_token']
    print('token:', res_token['access_token'])
    print('expires_in:', res_token['expires_in'])
    return redirect(f'/me?token={token}')

@app.route('/me')
def me():
    token = request.args.get('token')
    res_me = requests.get(BASE_URL + 'users/@me', headers={ 'Authorization': f'Bearer {token}' })
    return res_me.content

if __name__ == "__main__":
    if not os.path.exists('config.ini'):
        raise FileNotFoundError('You need ./config.ini')
    else:
        parser = configparser.ConfigParser()
        parser.read('config.ini', encoding='utf-8')
        config = parser['DEFAULT']
        BASE_URL = 'https://discordapp.com/api/'
        scope = ['identify']
        CLIENT_ID = config['ClientId']
        CLIENT_SECRET = config['ClientSecret']
        REDIRECT_URL = config['RedirectUrl']
        authorize_params = {
            'response_type': 'code',
            'scope': '%20'.join(scope),
            'client_id': CLIENT_ID,
            'redirect_uri': REDIRECT_URL
        }
        app.run(port=3000)
```

読んで頂くとわかりますがかなり雑実装です、ご注意ください。

挙動としては、`/login` にアクセスすると Discord の `/oauth2/authorize` が叩かれ、得た URL 先へリダイレクトします。このとき得られる Redirect URL は Discord Application の `OAuth2` 欄からも生成できます。 `/oauth2/authorize` の詳しい説明は [こちら](https://discordapp.com/developers/docs/topics/oauth2#authorization-code-grant) から確認できます。リダイレクト先でユーザが認証を行うと、事前に登録してある callback URL（ここでは `/callback`）に自動でリダイレクトされます。ここで得た `code` を使って `/oauth2/token` を叩きアクセストークンをゲットします。あとはこちらで準備した `/me`（`/users/@me` を叩いたレスポンスを表示する）にリダイレクトするとほしかった情報が手に入る。という流れになっています。`exchange_code()` は [ドキュメントに書いてあったコード](https://discordapp.com/developers/docs/topics/oauth2#authorization-code-grant-access-token-exchange-example) をそのまま使いました。ドキュメントのサンプルコードが Python なのは助かりました。

## 注意

コードを書いてるときにひとつだけ詰まったことがありました。それは `ngrok` の URL が起動し直すたびに変わることです。`ngork` を再起動するとき、開発はじめのときは必ず Discord に登録した callback URL を登録し直しましょう。よく Not Found と怒られました。

## おわり

この記事は以上となります。本当はアクセストークンをゲットした後にカスタムステータスを API でイジれないかを調べるために実装したのですが OAuth が無知すぎて認証を実装するだけで燃え尽きました。気が向いたら本題の方も調査していきたいです~~（やろうとするころには公式から API 出てそう）~~。はじめて OAuth 認証を実装しましたが、いい勉強になりました。いっぱい勉強してるけど雰囲気がいまいち掴めないというかたは一度簡単な認証を実装してみると良いかもしれません。

Twitter: [@OldBigBuddha](https://twitter.com/OldBigBuddha)
