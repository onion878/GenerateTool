# 代码构建工具

![截图](https://generate-docs.netlify.com/screen.png)
##用处

一个用来自定义模板并生成代码的工具。<br>
可以运行于linux,windows,mac平台。<br>
比如在java微服务中我们写一个方法或者基础类可能会修改多个文件但是方法或类只有业务处理层不一样，其它都是一样的情况下就可以通过该工具来创建同时能够在一定程度上保证代码统一规范性。<br>

## 使用教程
https://blog.csdn.net/qq_36224522/article/details/81268630

## 实现功能

- 自定义模板
- 自动生成文件

## 构建项目


```bash
# 下载源码
git clone https://github.com/onion878/GenerateTool.git
# 安装build工具
npm install --global windows-build-tools
# 进入项目
cd GenerateTool 
# 安装依赖
npm install
# 启动项目
npm start
# 构建win平台exe运行程序
npm run dist
```

## 下载
- [Releases](https://github.com/onion878/GenerateTool/releases)


## 相关文档

- [electron.atom.io/docs](http://electron.atom.io/docs) - electron官方文档
- [extjs-gpl](https://docs.sencha.com/extjs/6.5.0/classic/Ext.html) - ExtJS官方文档
- [monaco-editor](https://microsoft.github.io/monaco-editor/) - 编辑器
- [swig](https://github.com/paularmstrong/swig) - 模板创建
## License

[CC0 1.0 (Public Domain)](LICENSE.md)
