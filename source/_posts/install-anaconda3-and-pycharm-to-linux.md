---
title: Linux に Anaconda3 と PyCharm を入れる
date: 2019-04-28
tags:
- [Python]
- [Anaconda3]
- [PyCharm]
---
先日 Udemy で [@sakaijun](https://twitter.com/sakaijun) さんの [Python 入門 ＋ 応用のコース](https://www.udemy.com/share/100ZLuBEcfcl1URnQ=/) を購入しました。環境構築のセクションで [Anaconda](https://www.anaconda.com/) と [PyCharm](https://www.jetbrains.com/pycharm/) を導入するのですが、Linux 版の解説がなかったので自分でやったことをまとめておきます。

ちなみに私は [GitHub Education](https://education.github.com/) の [Student Developer Pack](https://education.github.com/pack) に登録しているので、PyCharm の Professional 版を利用しています。学校発行のメールアドレスがなくても学生書の写しを GitHub に投げるだけで色々なサービスを受けられるので、学生のかた（とくに高校生）はぜひ利用してみてください。

ちなみにディストリビューションは [Feren OS](https://ferenos.weebly.com/)（Mint Linux の派生ディストリビューション）です。

*注: 上の動画を視聴できることを前提で書いているので、細かいところは省いています。*

# Anaconda 3 のインストール
まずは Anaconda 3 をインストールします。[こちら](https://www.anaconda.com/distribution/) からインストールスクリプトをダウンロードできますので、`64-Bit (x86) Installer` ってのを落としてきます。

落とした `.sh` を実行するといい感じにインストールが始まります。

```
$ wget https://repo.anaconda.com/archive/Anaconda3-2019.03-Linux-x86_64.sh
$ sh Anaconda3-2019.03-Linux-x86_64.sh
```

なんかインストール先はどこにするかやシェルの設定ファイルに書き込むかを途中聞いてくるので、ご自身の環境に合わせてカスタマイズしてください。

ちなみに僕は Zsh を使っているので、最後自動で `.bash_profile` に挿入されたスクリプトを自分の `.zshrc` へ書き写しました。

それと Anaconda のコマンドを使うために `$PATH` へディレクトリパスを登録しておきます。Bash を利用されている方はスクリプトで追記されていると思いますが、それ以外のシェルを使っている方はご自身で PATH を通しておく必要があると思います。細かい話ですが、Zsh の場合は環境変数を `.zshenv` で設定します。

以上のことができたら `conda info` でインストールできたかを確認します。私の環境で実行すると以下のようになりました。Anaconda はホームディレクトリに `work_dir` というディレクトリを作って、そこに置いています。

```
$ conda info

     active environment : base
    active env location : /home/developer/work_dir/anaconda3
            shell level : 1
       user config file : /home/developer/.condarc
 populated config files :
          conda version : 4.6.11
    conda-build version : 3.17.8
         python version : 3.7.3.final.0
       base environment : /home/developer/work_dir/anaconda3  (writable)
           channel URLs : https://repo.anaconda.com/pkgs/main/linux-64
                          https://repo.anaconda.com/pkgs/main/noarch
                          https://repo.anaconda.com/pkgs/free/linux-64
                          https://repo.anaconda.com/pkgs/free/noarch
                          https://repo.anaconda.com/pkgs/r/linux-64
                          https://repo.anaconda.com/pkgs/r/noarch
          package cache : /home/developer/work_dir/anaconda3/pkgs
                          /home/developer/.conda/pkgs
       envs directories : /home/developer/work_dir/anaconda3/envs
                          /home/developer/.conda/envs
               platform : linux-64
             user-agent : conda/4.6.11 requests/2.21.0 CPython/3.7.3 Linux/4.15.0-48-generic ubuntu/18.04 glibc/2.27
                UID:GID : 1000:1000
             netrc file : None
           offline mode : False
```

# PyCharm のインストール
僕は JetBrains 社製の製品をインストールする際は [Toolbox App](https://www.jetbrains.com/toolbox/app/) を利用しています。ワンクリックで新規インストールやアップデート、アンインストールが行えるので非常に楽です。

下の画像は Toolbox App でアップデートしてる画面です。インストール先のパスや、インストールするバージョンなども簡単に設定できて重宝しています。Android Studio が対応しているのは驚きました。

![Toolbox App で IntelliJ IDEA Ultimate をアップデートしてる画面](https://res.cloudinary.com/simpleisbest/image/upload/q_auto:good/v1556442378/Linux%20%E3%81%AB%20Anaconda3%20%E3%81%A8%20PyCharm%20%E3%82%92%E5%85%A5%E3%82%8C%E3%82%8B/JetBrains%20Toolbox%20App.webp)

PyCharm をインストールできたらあとは自分好みの設定をしてプロジェクトを作って幸せな Python Life を送っていくだけです。プロジェクトを新規作成する際にインストールした Anaconda を指定することを忘れずに。