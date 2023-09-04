# 首先安装git工具
浏览器访问：https://github.com/git-for-windows/git/releases/tag/v2.41.0.windows.1 \
下载：Git-2.41.0-64-bit.exe

安装后，电脑上就有了git命令。

# 第一次下载
`````
git clone https://github.com/greatmusicians/wiki.git
可编辑ow_wiki.config.json，指向下面路径

git clone https://github.com/greatmusicians/Menschen.git
git clone https://github.com/greatmusicians/Menschen2.git
git clone https://github.com/greatmusicians/other.git
`````

# 后续更新
`````
首先尝试
git pull


如果本地有更改，可能会报错。那么可以选择丢弃所有修改（或者先备份自己做的修改）
git fetch
git checkout origin/main
`````


