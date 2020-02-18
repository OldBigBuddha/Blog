---
title: Python 3.7.3 をビルドする
date: 2019-04-27
tags:
 - [Python]
 - [Python 3.7.3]
code: true
---
Feren OS に Python 3.7.3 を自分でビルドしてインストールしたときのメモです。

*`python3: error while loading shared libraries: libpython3.7m.so.1.0: cannot open shared object file: No such file or directory` の対処法は一番下に書いてあります。*

Feren OS は Mint Linux の派生ディストリビューションなので、Debian系はここに書いてある通りすればいけると思います。（多分）

## ソースコードの入手

[公式サイトにコードが転がっている](https://www.python.org/downloads/source/) のでそこから落としてきます。

2019/04/27 現在の最新版は [Python 3.7.3](https://www.python.org/downloads/release/python-373/) です。

落としてきたら `tar xvf` で解凍しておきます。

以下はすべて Python 3.7.3 を落とした場合のターミナルの様子です。

```sh
$ wget https://www.python.org/ftp/python/3.7.3/Python-3.7.3.tgz
$ tar xvf Python-3.7.3.tgz
$ cd Python-3.7.3
```

## ビルド

まずはビルドに必要なツールをインストールしておきます。

```sh
$ sudo apt update
$ sudo apt install build-essential libbz2-dev libdb-dev \
  libreadline-dev libffi-dev libgdbm-dev liblzma-dev \
  libncursesw5-dev libsqlite3-dev libssl-dev \
  zlib1g-dev uuid-dev tk-dev
```

{% noindent 参考: [Ubuntu環境のPython - python.jp](https://www.python.jp/install/ubuntu/index.html) }

続いて `make` を利用してビルドします。FFmpeg みたいに色々オプションがあるわけではないです。なんか `--enable-optimizations` をつけるといい感じになるという話を聞いたのでつけておきます。

```sh
$ ./configure --enable-optimizations --enable-shared
$ make -j4 && sudo make altinstall
```

すでに Python が入っている場合、パスの通し方によっては `python3` コマンドが `3.7` にあがってしまうので、`altinstall` を利用することが推奨されています。

Intel Core i5-4200M、RAM 8GB で SSD な ThinkPad E440 でビルドした場合、30分ほどかかりました、参考までに。

## libpython3.7m.so.1.0 がないと怒られる

これで無事インストールできたと思って `python 3.7` を実行すると `python3: error while loading shared libraries: libpython3.7m.so.1.0: cannot open shared object file: No such file or directory` が出ました。いろいろ調べてみると `libpython3.7m.so.1.0` を見つけられないから怒られるらしいので、場所を教えてやります。

- 参考1: [Python3.7をUbuntu16.04にインストールする - まんぼう日記](https://lionneko.hatenablog.com/entry/2019/01/08/105537)
- 参考2: [python: error while loading shared libraries: libpython3.4m.so.1.0: cannot open shared object file: No such file or directory - Stack Overflow](https://stackoverflow.com/questions/43333207/python-error-while-loading-shared-libraries-libpython3-4m-so-1-0-cannot-open)

僕の場合は以下のようにパスを登録し、そのパス先に落としてきた `Python-3.7.3` に入っていた `libpython3.7m.so.1.0` をコピーしたらうまくいきました。

```sh
$ sudo mkdir /opt/python373/lib
$ sudo vim /etc/ld.so.conf.d/libpython.conf # /opt/python373/lib の一行を追加
$ sudo ldconfig -v
```

これで無事 Python 3.7.3 がインストールできた、やったね。

```sh
$ python3.7 --version
Python 3.7.3
$ pip3.7 --version
pip 19.0.3 from /usr/local/lib/python3.7/site-packages/pip (python 3.7)
```
