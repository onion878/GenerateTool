## 说明
[1] 采用js脚本配置<br>
[2] 在生成**后**执行js脚本,如完成对修改和创建的文件提交等操作
## svn提交文件例子
```
const { execSync } = require('child_process');
// 获取定义的data
const data = getAllData();
execSync(`svn commit -m '${data.name}' ${data.file}`);
console.log('文件提交成功:[' + data.file + ']成功');
```
其中`getAllData()`为获取数据模板中所有数据的内置方法
