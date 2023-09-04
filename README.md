# 首先安装git工具
浏览器访问：https://github.com/git-for-windows/git/releases/tag/v2.41.0.windows.1 \
下载：Git-2.41.0-64-bit.exe

安装后，电脑上就有了git命令。

# 第一次下载
`````
git clone https://github.com/greatmusicians/wiki_deutsch.git

如果无法成功，可以使用gitclone代理(不能保证最新)
git clone https://gitclone.com/github.com/greatmusicians/wiki_deutsch.git
`````

# 后续更新
`````
如果有更改，则丢弃所有修改
git fetch
git checkout origin/main

如果没有修改，可以直接更新
git pull
`````


