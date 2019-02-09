---
title: Debian9で手ブレ補正をかけるために奮闘した
date: 2019-02-09 23:04:56
tags:
  - [ffmpeg]
  - [debian]
---
先日旅行に行ってきて、たくさんの動画を取ってきたのですが、手ブレが酷い。特にスキーで移動している最中の動画なんか確認しているだけで良いそうなほど酷い。

今度友達に見せる約束をしているのですが、流石に手ブレ補正ぐらいはせんと思ったわけです。

しかしながら、Aeなんて高価なものは持っておらず、更に手元のPCはDebianです。Linuxはあまり動画編集に強くないイメージなのでどうしようかと心配していたところ、どうやらffmpegを利用すれば結構高品質な手ブレ補正ができるとわかったので、やってみることにしました。

(最初に言っておくと手ブレ補正をするためにffmpegをローカルビルドするというお話です。)

# ffmpegで手ブレ補正ができるらしい
どうやら[vid.stab](http://public.hronopik.de/vid.stab/)を用いるとffmpegを利用して手ブレ補正が実現できるというお話をキャッチしました。`vid.stab` は一回目のエンコードでブレ情報を作成し、二回目のエンコードでその情報を基に補正を書けていくという方式で手ブレ補正を行うそうです。二回エンコードを行うので、ストリーミングには利用できないとのことです。

昔はプラグインとして公開されていましたが、現在はビルド時に `libvidstab` を enable にすると使えるようになる、という方式でした。

# ということでローカルビルド
`apt` 経由でインストールするffmpegでは `libvidstab` が enable ではないので、ローカルビルドをする必要があります(多分)。

ビルドするにあたって、`${HOME}/ffmpeg` というディレクトリを作り、ライブラリのビルドの際には更にその下に `libs` というディレクトリを作成しました。

この記事で紹介する手法は以下のページを参考にして行いました。ffmpegは更新頻度が高めなので、常に公式サイトを確認しつつ行われることをおすすめします。

- [CompilationGuide/Ubuntu – FFmpeg](https://trac.ffmpeg.org/wiki/CompilationGuide/Ubuntu)
- [H.264対応のffmpegをLinux環境でビルドする - 動かざることバグの如し](http://thr3a.hatenablog.com/entry/20180718/1531920275)
- [[FFmpeg] ffmpeg に libx265 をリンクする - Qiita](https://qiita.com/pb_tmz08/items/29165f4c3ef9bc4285ab)

## ライブラリのビルド
まずは `x264` を利用するために `Yasm` と `NASM` をビルドします。ライブラリに関することですので、 `${HOME}/ffmpeg/libs` 下で行います。

`Yasm` のダウンロード／ビルド／インストール。

```
wget http://www.tortall.net/projects/yasm/releases/yasm-1.3.0.tar.gz
tar xvf yasm-1.3.0.tar.gz
cd yasm-1.3.0
./configure --prefix=/usr/local
make && sudo make install
```

`NASM` のダウンロード／ビルド／インストール。

```
wget https://www.nasm.us/pub/nasm/releasebuilds/2.13.03/nasm-2.13.03.tar.bz2
tar xvf nasm-2.13.03.tar.bz2
cd nasm-2.13.03
./autogen.sh
./configure --prefix=/usr/local
make && sudo make install
```

準備ができたので、 `x264` のダウンロード／ビルド／インストール。

```
git clone git://git.videolan.org/x264.git
cd x264/
./configure  --enable-shared --disable-opencl --prefix=/usr/local
make && sudo make install
```

続いて、 `x265` でも出力ができるようにしたいので、 `x265` のダウンロード／ビルド／インストール。`x265`は `mercurial` を用いてバージョン管理がされています。私は `mercurial` を使ったことがなかったので、今回のためにインストールしました。

```
sudo apt-get install mercurial libnuma-dev
hg clone https://bitbucket.org/multicoreware/x265
cd x265
cmake -G "Unix Makefiles" -DCMAKE_INSTALL_PREFIX=/usr/local -DENABLE_SHARED=off
make && sudo make install
export LD_LIBRARY_PATH=${LD_LIBRARY_PATH}:/usr/local/lib
```

音声関係は何もわからないのですが、最低限は必要なので `AAC` と `mp3` 系のライブラリを導入。

`FDK-ACC` のダウンロード／ビルド／インストール。

```
git clone --depth 1 https://github.com/mstorsjo/fdk-aac
cd fdk-acc
autoreconf -fiv
./configure --prefix=/usr/local
make && sudo make install
```

`LAME` をダウンロード／ビルド／インストール

```
wget -O lame-3.100.tar.gz https://downloads.sourceforge.net/project/lame/lame/3.100/lame-3.100.tar.gz
tar xvf lame-3.100.tar.gz
cd lame-3.100
./configure --prefix="/usr/local" --bindir="/bin" --enable-nasm
make && sudo make install
```

これでライブラリは揃いました。後は本命の `vid.stab` です。

```
git clone https://github.com/georgmartius/vid.stab
cd vid.stab
cmake .
make && sudo make install
export PKG_CONFIG_PATH=/usr/local/lib/pkgconfig/
```

## ffmpegをビルドする
準備が整いましたので本体のビルドを行います。本体のビルドはちょっと時間がかかります。カレントディレクトリは `${HOME}/ffmpeg` です。

`./configure` のところで `GPL` と `Nonfree` に同意しています。

```
wget -O ffmpeg-snapshot.tar.bz2 https://ffmpeg.org/releases/ffmpeg-snapshot.tar.bz2
tar xjvf ffmpeg-snapshot.tar.bz2
cd ffmpeg
./configure --enable-gpl --enable-nonfree --enable-libx264 --enable-libx265 --enable-libfdk-aac --enable-libmp3lame --enable-libvidstab
make && make install
```

これで無事 `vid.stab` が有効化された `ffmepg` が完成しました。

# 実際に使ってみる
以下のコマンドで手ブレ補正が実行されます。

```
ffmpeg -i hoge.mp4 -vf vidstabdetect -an -f null -
ffmpeg -i hoge.mp4 -vf vidstabtransform -y out.mp4
```
`hoge.mp4` を読み込んで、補正後の動画を `out.mp4` として出力しています。

無料でここまで手ブレ補正ができるのかって感じです。Aeの手ブレ補正が最強という話を聞いたので、気が向いたときに友達に頼んで比較でもしてみます。

以下から `vid.stab` で利用するオプションの詳細が確認できます。

- [【ffmpeg】強力な手ぶれ補正フィルタ vid.stab の使い方 : ニコニコ動画研究所](https://looooooooop.blog.fc2.com/blog-entry-1108.html)
- [FFmpeg Filters Documentation](https://ffmpeg.org/ffmpeg-filters.html#vidstabdetect-1)