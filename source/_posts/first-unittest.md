---
title: 初めてテストっぽいものを書いた
code: true
date: 2020-11-12 00:31:42
tags:
  - [Python]
---

本格的にプログラミングをやり始めて大体5年半ぐらい経過しますが、初めて意識してテストコード書きました。この文章はただそれだけのことに対して独り言を連ねたものです。

## こんな感じのテストを書いたよ

やっぱ人間自分が「できた！」と思えることは他人に見せびらかしたくなるものなので、ここに貼りたいので貼っておきます。

```py
import os
from typing import Dict, List

import pytest

from twitter_api_v2 import Tweet, TwitterAPI


@pytest.fixture
def client() -> TwitterAPI.TwitterAPI:
    return TwitterAPI.TwitterAPI(os.environ["TWITTER_BEARER_TOKEN"])


def test_minimum_tweet(client: TwitterAPI.TwitterAPI) -> None:

    SAMPLE_TWEET: Dict = {
        "id": "1212092628029698048",
        "text": "We believe the best future version of our API will come from building it with YOU. Here\u2019s to another great year with everyone who builds on the Twitter platform. We can\u2019t wait to continue working with you in the new year. https://t.co/yvxdK6aOo2",
    }

    tweet: Tweet.Tweet = client.get_tweet(SAMPLE_TWEET["id"])

    assert tweet.text == SAMPLE_TWEET["text"], "text field is wrong."
```

自作の Twitter API ラッパーの動作をチェックするために書きました。ここで挙げているのは最小機能の正常テストケースです。初めて書いたのでこういう風に書いたほうが良いみたいなのはいっぱいある気がしますが、今はテストを書いた自分を褒めようと思います。

## 書いた感想

コードを変更することに対して気軽になった気がします。機能追加はもちろんのこと、コードの分割などのリファクタリングをするにもテストがあるからとりあえず書き換えてみようみたいな感覚で楽しくコーディングができています。テストすげぇ、何でもっと早くからやってこなかったんだろう……。

まぁ、初めて本格的にやったプログラミングが Android 開発なんでテストコードが書きにくかった（？）というのも大きいとは思います。余談ですが、最近 Nodejs や Python で書き書きしてると Android は難しかったな〜なんてことを思います。むしろ一番最初に書いて正解でした、もし書いたことがなかったら今後触ろうという気が起きないんじゃないかな。実際今デスクトップ用のソフトを書く気無いし……。

## テストに対して持ってた印象

テストの存在自体は高校に入ったときぐらいから把握していたような気がします。把握はしてましたが、なかなか書く気が起きませんでした。面倒くさそうだし。今回テストを書いたとは言え、じゃぁ当時最も触っていた Android のテストを次書けるかと問われるとｳｯとなります。大学に入ってから Codelab でもやりつつ勉強します。

テストを書くのがめんどくさいのはまだ思っています。期待する結果と比較してそれに対してメッセージを設定するだけなので、正直やってる行為自体はプログラミングの中でも退屈な部類に入るんじゃないかなと少し思ってます。テストがコードの品質を保証するということを言葉では理解していますが、趣味レベルだとう〜んって感じです。業務になるとやっぱり話が変わってくるのかな。

## これから

ようやくテストという存在に少しだけ触れられた段階なので、これからどんどんテストに関する知見を集めていこうとは思います。今回はただ返り値を比較するだけだったわけですが、世の中には UI テストであったり外部リソースを使う場合の Mock だったりと色々手段種類があるようなので、そこらへんを意識しつつ調べつつコード書きつつって感じですね。

テストなんか個人開発では全く縁がなくて将来インターンとか就職先でいっぱい教えてもらおうっていう他力本願的な気持ちだったので、今回テストを書いてみようという気持ちになれてよかったです。
