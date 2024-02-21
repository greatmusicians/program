# 首先安装git工具
浏览器访问：https://github.com/git-for-windows/git/releases/tag/v2.41.0.windows.1 \
下载：Git-2.41.0-64-bit.exe

安装后，电脑上就有了git命令。

# 创建一个单独的文件夹
创建一个单独的文件夹。可以在任意位置创建，可以是任意名称。下面以在D盘新建文件夹wiki_deutsch示例。

# 拉取程序和数据
`````
cd D:\wiki_deutsch
git clone https://github.com/greatmusicians/program.git
git clone https://github.com/greatmusicians/Menschen.git
git clone https://github.com/greatmusicians/Menschen_Berufstrainer.git
git clone https://github.com/greatmusicians/Menschen_Intensivtrainer.git
git clone https://github.com/greatmusicians/Menschen_Testtrainer.git
git clone https://github.com/greatmusicians/other.git
`````

program中只有编译好的程序文件，源代码见：https://github.com/wsva/als_server

# 关于后续更新
为了避免文件冲突，您尽量在现有的文件夹中新增、修改文件。尽可以新建一个自己的文件夹。

把D:\wiki_deutsch\program下面的git.bat复制到D:\wiki_deutsch下面，以后就可以直接执行下面两个命令更新了

`````
cd D:\wiki_deutsch\
.\git.bat pull
`````

# 如果不小心做了更改怎么办
如果本地有更改，pull可能会报错。那么可以选择丢弃所有修改（或者先备份自己做的修改）

`````
比如因为修改了Menschen里面的文件导致报错
cd D:\wiki_deutsch\Menschen
git fetch
git checkout origin/main
`````

# 启动，停止
启动程序的方法，进入D:\wiki_deutsch\program，双击start.vbs，然后自动打开浏览器

也可以用浏览器直接访问http://loclhost:1235

# 关于程序原理的简单介绍
`````
cd D:\wiki_deutsch\program
.\als_server -h
有一些简单的帮助信息，比如指定其他端口号，指定其他配置文件
`````

`````
cd D:\wiki_deutsch\program
.\als_server config print
可以看到程序的配置
`````

`````
默认的配置中包含如下：

"DirectoryList": [
    {
      "Path": "../",
      "UseChildren": true,
      "IsPublic": false
    }
  ],

表示D:\wiki_deutsch里面的所有文件夹都会被自动添加
`````

`````
hidden.txt文件的作用

在某个文件夹中放置hidden.txt文件，可以使程序在生成的页面中不包含这个文件夹，达到“隐藏”的效果
`````