---
title: Debianでラジオ用の静止画動画を作る
date: 2018-12-02
tags:
  - [Linux]
  - [ffmpeg]
---

この記事は[Linux Advent Calendar 2018 2日目](https://qiita.com/advent-calendar/2018/linux)の記事です。

僕は今フィンランドに留学しています。

ふと、「留学の様子をラジオにして日本の友達に伝えよう!」と思ったのですが手元にはLinux機(Debian9)しかありません

日本にいるときはWindows機もあったのでそちらを使っていたのですが、今はそうもいきません。

てことでLinuxでどうにかラジオ動画が作れないかと工夫結果がこの記事です。

# 流れ
1 収録はスマホ(Android)で行う

2 Google Driveを介してPCへ転送

3 ノイズの修正や、不要部分をAudacityでカットする

4 Youtubeに上げられるように、その音声に動画をくっつける ← ここのお話

# 実装
[ffmpegで静止画と音声をくっつけた映像を作る](https://qiita.com/ottyajp/items/4cd5280b4b8e8ff331e1)を参考にしました。~~というかほぼそのまんま。~~

同階層に対象の音声ファイルと画像ファイルがあることを前提に作成しました。

`./encode -i {画像ファイル名} -s {音声ファイル名} -o {出力ファイル名}`でラジオ動画が作成されます。

```
#!/bin/bash

CMDNAME=`basename $0`

if [ $# -ne 6 ]; then
    echo "Usage: $CMDNAME [-i image] [-s sound] [-o output]" 1>&2
    exit 1
fi

while getopts i:s:o: OPT
do
    case $OPT in
        "i" ) image="$OPTARG";;
        "s" ) sound="$OPTARG";;
        "o" ) output="$OPTARG";;
        * ) echo "Usage: $CMDNAME [-i image] [-s sound] [-o output]" 1>&2
        exit 1;;
    esac
done


dur=`avprobe $sound 2>&1 | grep Duration | sed -e s/Duration:\ // -e s/,.*//`

ffmpeg -f image2 -r 1 -loop 1 -t $dur -i $image temp.mp4 -s 1280x720 -c:v libx265 -tune ssim -y > /dev/null 2>&1
ffmpeg -i temp.mp4 -i $sound -s 1280x720 -c:a libmp3lame -c:v libx265 -tune ssim -y $output > /dev/null 2>&1
rm temp.mp4

avprobe $output 2>&1 | grep -e Duration -e Stream | sed 's/^[ \t]*//' | sed -n 's/\(Duration: [^,]*\).*/\1/p; s/.*\(Video: [^(]*\).* \([0-9][0-9]*x[0-9][0-9]*\).*/\1\2/p; s/.*.*\(Audio: [^(]*\).*/\1/p;'
exit
```

主に動画を出力するところにこだわりました。

## 静止画から動画を生み出す
`ffmpeg -f image2 -r 1 -loop 1 -t $dur -i $image temp.mp4 -s 1280x720 -c:v libx265 -tune ssim -y > /dev/null 2>&1`

なるべく動画のサイズを抑えたかったので、H.265を採用しています。

また、動きが一切ない動画ですのでfps(1秒間に表示されるフレーム数、Youtubeでよく見るのは30fpsや60fps)は1(`-r 1`)にしています。

ffmpegのオプションを調べると静止動画には`-tune ssim`を使うというのを見たので使ってます。

参考したURLを紛失したので代わりのURL貼っておきます。

[Preset Options — x265 documentation](https://x265.readthedocs.io/en/default/presets.html)

初めはPresetを指定していましたがあまり変化が見られなかったので今は指定していません。

```
dur=`avprobe $sound 2>&1 | grep Duration | sed -e s/Duration:\ // -e s/,.*//`
```
を利用して取得した音声の長さピッタリの動画を生成しています。

## 生成した動画に音声をくっつける
`ffmpeg -i temp.mp4 -i $sound -s 1280x720 -c:a libmp3lame -c:v libx265 -tune ssim -y $output > /dev/null 2>&1`

音声はLAMEを、動画は先ほどと同じくH.265を利用しています。

## ちゃんと意図した動画構成かを確認
```
avprobe $output 2>&1 | grep -e Duration -e Stream | sed 's/^[ \t]*//' | sed -n 's/\(Duration: [^,]*\).*/\1/p; s/.*\(Video: [^(]*\).* \([0-9][0-9]*x[0-9][0-9]*\).*/\1\2/p; s/.*.*\(Audio: [^(]*\).*/\1/p;'
```

正規表現を利用して、`avprobe`から確認したい情報だけを切り出します。

動画の長さと、ビデオ/オーディオコーデックを抜き出しています。

# 使ってみた感想
非常に楽です(小並感)。

手元のPCが(動画編集をするには)低スペック & Linuxは動画編集が苦手というイメージがあったので、動画を作成するのに最低限の環境だけ整えてみました。

動画というグラフィカルなものを編集するとなるとどうしてもGUIが必要となってきますが、その中にコマンド操作を入れて可能な限り自動化できたので個人的には満足です。