## 说明
[1] 采用js脚本配置<br>
[2] 在生成**前**执行js脚本,如完成对要修改的文件先进行更新等操作
## svn更新文件例子
```
const { execSync } = require('child_process');
// 获取定义的data
const data = getAllData();
execSync(`svn update ${data.file}`);
console.log('更新文件:[' + data.file + ']成功');
```
其中`getAllData()`为获取数据模板中所有数据的内置方法
