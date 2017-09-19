﻿# 基于seajs 和 gulp 的構建工具
## 功能
````php
   1. js 压缩和编译
   2. scss 预编译
   3. 图片压缩
   4. 热更新
   5. jshint 代码检测
   6. 基于seajs的模块化思想
````

#### 源码目录 src  
````php
    css   是存放css的目录
    img   是存放图片的目录
    js    是存放一般的js文件
    plugin 是存放插件js
    scss  是存放scss文件
````
#### 编译目录 dist 目录结构和源码目录一样
````php

    目录结构和源码目录一样

````
### cmd命令行执行 git clone git@github.com:JerryMark1/seajsGulpModule.git
### 克隆下来后 执行 npm install 安装相关的模块
### 第一次构建 使用 gulp build 构建出来的文件都是压缩的，  xx.min.xx 这样的形式 所以引入的时候注意看
### 然后时候 gulp watch 来实时检测文件