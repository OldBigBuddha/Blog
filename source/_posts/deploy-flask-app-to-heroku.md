---
title: Heroku に Flask で作った Web アプリをデプロイする
date: 2019-11-08 15:15:02
tags:
  - [Python]
  - [Flask]
  - [Heroku]
code: true
---
最近 Flask で Web API っぽいのを作ってるんですが、いい感じにできてきたので Heroku で公開しようかな、なんてことを考えています。

Heroku は Discord Bot をホスティングするときに使ってましたが、Web アプリは恐らくはじめてですし Flask というフレームワークで Heroku は初の試みなので簡単なデモアプリを作ってホスティングしてみました。

## 環境

`pipenv` を使って開発環境を管理しています。Pipfile は以下の通りです。

```Pipfile
[[source]]
name = "pypi"
url = "https://pypi.org/simple"
verify_ssl = true

[dev-packages]

[packages]
flask = "*"
gunicorn = "*"

[requires]
python_version = "3.8"
```

Python は 3.8.0、Flask は 1.1.1 でやってます。2019/11/08 現在、Heroku は Python 3.8.0 をフルサポートしていませんが、なんか上げたら動いたので 3.8.0 でやっていきます。

## ソースコード

中身はルートにアクセスしたら `Hello World` と表示するだけのとてもシンプルなものです。

```server.py
import os

from flask import Flask


app = Flask(__name__)


@app.route('/')
def hello():
    return 'Hello World'


if __name__ == '__main__':
    app.run(port=os.environ.get('PORT', 5000))

```

## Heroku に上げる準備

Flask のアプリ（といいうか Python 製の Web アプリ）を Heroku で動かすには WSGI と呼ばれるインターフェイスが必要です。今回は [gunicorn](https://gunicorn.org/) というものを使います。なのでまずは gunicorn をインストールします。（さっきの Pipfile にはインストール後の Pipfile です。）

```console
$ pipenv install guincorn
```

念の為 gunicorn で Flask アプリが動くかを確認してみます。gunicorn は `gunicorn [OPTIONS] APP_MODULE` で動作します。`APP_MODULE` は大体 `$(MODULE_NAME):$(VARIABLE_NAME)` で指定するようです。なので今回の場合は以下のコマンドで動くはずです。

```console
$ gunicorn server:app
[2019-11-08 15:49:37 +0900] [93932] [INFO] Starting gunicorn 19.9.0
[2019-11-08 15:49:37 +0900] [93932] [INFO] Listening at: http://127.0.0.1:8000 (93932)
[2019-11-08 15:49:37 +0900] [93932] [INFO] Using worker: sync
/Users/developer/.local/share/virtualenvs/Flask_Heroku_Test-LqQPIm6h/lib/python3.8/os.py:1021: RuntimeWarning: line buffering (buffering=1) isn't supported in binary mode, the default buffer size will be used
  return io.open(fd, *args, **kwargs)
[2019-11-08 15:49:37 +0900] [93934] [INFO] Booting worker with pid: 93934
```

動きました。あとはこのコマンドを実行してくれと Heroku に教えるだけです。

## Procfile

Heroku に起動コマンドを伝える方法が Procfile。公式ドキュメントは [こちら](https://devcenter.heroku.com/articles/procfile) にあります。

Procfile のフォーマットは `<process type>: <command>`。Process Type は `web`、Command はさっきの通り `gunicorn server:app` です。なので今回の場合、 Procfile はこんな感じになります。

```
web: gunicorn server:app --log-file -
```

最後の `--log-file -` をつけることでログがコンソールで表示されるので `heroku logs` などでも Flask のログが確認できるようです。

## あとはいつも通りに

あとは git でよしなにして heroku へ push しましょう。必須ではありませんが `runtime.txt` に `python-3.8.0` と書いておくといいかも知れません。これで Flask アプリを Heroku にあげることができました、やったね。
