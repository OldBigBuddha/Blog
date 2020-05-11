---
title: LaTeX を Mac(Catalina) にインストールする
code: true
date: 2020-05-11
tags:
  - [LaTeX]
---

数学の勉強をしてるときに数式も PC で打ちたいなと思って [Mathcha](https://www.mathcha.io/about) を使っていたんですが、この記号はどうすればという場面が多々あったので LaTeX に乗り換えようと思いました。ちゃんと調べたら色々出るのかもしれませんが、勉強するときにあれなんだっけこれなんだっけと毎回ググるのは非効率なので、どうせググるなら LaTeX をやったほうがあとあと便利かなと思った次第です。

なお、本記事のセットアップは以下の環境で行っています。

- OS: macOS Catalina Version 10.15.3
- Shell: zsh 5.7.1 (x86_64-apple-darwin18.7.0)
- Homebrew: 2.2.15
- Homebrew/homebrew-core: Git revision 95110; last commit 2020-05-11
- Homebrew/homebrew-cask: Git revision 1dff7; last commit 2020-05-11
- Editor: VSCode 1.45.0(commit d69a79b73808559a91206d73d7717ff5f798f23c)

## MacTeX をインストール

Mac 上で LaTeX を利用するには MacTeX と呼ばれる専用のディストリビューションを使うそうなので、Homebrew を使ってインストールします。MacTeX についての詳しい内容は [TeX Wiki](https://texwiki.texjp.org/?MacTeX) を読んでください。

```command
brew cask install mactex-no-gui
```

ここでは GUI アプリケーションが付属していない MacTeX をインストールしています。 GUI アプリケーション付属版には [LaTeXiT](https://texwiki.texjp.org/?LaTeXiT) と [TeXShop](https://texwiki.texjp.org/?TeXShop) が含まれています。詳細はリンク先で確認してください。必要だと思ったら `mactex-no-gui` を `mactex` に変えて実行して下さい。

ファイルのダウンロードと、インストーラーの実行に時間がかかります。管理者パスワードを入力した後レスポンスがありませんが、インストール中なのでしばらく放置しておきましょう。

インストールが完了したら Terminal を再起動してください。bash や zsh ユーザーの方は再起動の代わりに `eval "$(/usr/libexec/path_helper)"` を実行するという手段もあります、お好みでどうぞ。

## MacTeX のリポジトリをアップデート

インストールが完了したら MacTeX のリポジトリをアップデートします。正確には MacTeX のベースとなっている [TeX Live](https://texwiki.texjp.org/?TeX%20Live) のリポジトリをアップデートします。

```command
sudo tlmgr update --self --all
```

結構時間かかります、気長に待つか以下の設定を済ませておきましょう。

## VSCode を設定する

VSCode に LaTeX 用の設定をします。どうやら [LaTeX Workshop](https://marketplace.visualstudio.com/items?itemName=James-Yu.latex-workshop) というのが良さそうなのでこいつを VSCode に追加します。あとは VSCode の `setting.json` に設定を追記するだけです。私は以下のような設定にしました。

```json
  "latex-workshop.latex.tools": [
    {
      "name": "ptex2pdf",
      "command": "ptex2pdf",
      "args": [
        "-l",
        "-ot",
        "-kanji=utf8 -synctex=1 -interaction=nonstopmode -halt-on-error -file-line-error",
        "%DOCFILE%.tex"
      ]
    }
  ],
  "latex-workshop.latex.recipes": [
    {
      "name": "toolchain",
      "tools": [
        "ptex2pdf"
      ]
    }
  ],
  "latex-workshop.view.pdf.viewer": "tab",
```

どうやら `latex-workshop.latex.tools` の要素に `name` が必要になったようです。古い情報では `name` プロパティが設定されてなかったのでそこでつまずきました。ちゃんと公式ドキュメントも確認しないといけませんね、反省。

こちらの記事を参考にしました。

- [vscodeでlatex環境を整える際の謎の不具合 - HarukaのNote](http://haruka0000.hatenablog.com/entry/2018/07/20/190853)
- [[Catalina] MacTex 2019 + VS Code で LaTeX の環境を構築する - Qiita](https://qiita.com/khys/items/c47d73af8993890cb9e5)
- [VSCode でLatexの日本語環境を作る - GitHub](https://gist.github.com/Ikuyadeu/204d06fffd912f441b383eb02463e29b)
- [Compile · James-Yu/LaTeX-Workshop Wiki](https://github.com/James-Yu/LaTeX-Workshop/wiki/Compile#latex-recipes)

## Enjoy LaTeX

あとは LaTeX の文法を学んで数学の勉強をするだけです。午後の勉強時間が丸々飛びましたが良しとしましょう。（良くない）

## [補足]フォントについて

Wiki に TeX Live 2020 は標準で原ノ味フォントが使われるようになったためよく見かけるヒラギノフォントに関する設定は完全にオプショナルなものになりました。もしヒラギノを使いたい場合は [こちら](https://texwiki.texjp.org/?%E3%83%92%E3%83%A9%E3%82%AE%E3%83%8E%E3%83%95%E3%82%A9%E3%83%B3%E3%83%88#macos-hiragino-setup) を参考にしてインストールしてください。

今回はとりあえず LaTeX が動くと言う状態をゴールにしていたのでフォントのセットアップはしませんでした。後日ヒラギノが良いと思ったらセットアップの工程を記事にしておきます。
