# GenerateTool

![screen](https://generate-docs.netlify.com/screen.png)

A tool for customizing templates and generating code. <br>
Can run on linux, windows, mac platforms. <br>
For example, in Java microservices, when we write a method or basic class, we may modify multiple files, but the method or class only differs in the business processing layer. If the others are the same, it can be created by this tool and can be created to a certain extent. Ensure that the code is uniform and standardized. <br>

## Documentation

```bash
# 下载源码
git clone https://github.com/onion878/GenerateTool.git
# 安装build工具
npm install --global windows-build-tools
# 进入项目
cd GenerateTool 
# 安装sqlite3依赖
npm install sqlite3 --build-from-source --runtime=electron --target=7.1.2 --dist-url=https://atom.io/download/electron
# 安装依赖
npm install
# 启动项目
npm start
# 构建win平台exe运行程序
npm run dist
```

## Download
- [Releases](https://github.com/onion878/GenerateTool/releases)


## Use package 

- [electron.atom.io/docs](http://electron.atom.io/docs) - electron
- [extjs-gpl](https://docs.sencha.com/extjs/6.5.0/classic/Ext.html) - ExtJS
- [monaco-editor](https://microsoft.github.io/monaco-editor/) - code editor
- [swig](https://github.com/paularmstrong/swig) - render template 

## License

[CC0 1.0 (Public Domain)](LICENSE.md)
