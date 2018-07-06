# 代码构建工具

##用处

一个用来自定义模板并生成代码的工具。<br>
可以运行于linux,windows,mac平台。<br>
比如在java微服务中我们写一个方法或者基础类可能会修改多个文件但是方法或类只有业务处理层不一样，其它都是一样的情况下就可以通过该工具来创建同时能够在一定程度上保证代码统一规范性。<br>

##实现功能

- 自定义模板(需要node基础知识)
- 自动生成文件

使用无需安装node，无需node相关知识。
## 修改源码


```bash
# Clone this repository
git clone https://github.com/onion878/GenaretorTool.git
# package app
npm install -g electron-packager
# Go into the repository
cd GenaretorTool
# Install dependencies
npm install
# Run the app
npm start
```


## 相关文档

- [electron.atom.io/docs](http://electron.atom.io/docs) - electron官方文档(有中文)
- [extjs-gpl](https://docs.sencha.com/extjs/6.5.0/classic/Ext.html) - extjs官方文档
- [monaco-editor](https://microsoft.github.io/monaco-editor/) - 编辑器

## License

[CC0 1.0 (Public Domain)](LICENSE.md)
