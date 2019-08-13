## 说明
[1] 采用js脚本配置<br>
[2] 配置结果可以在生成模板中采用swig过滤器使用
## 配置json转字符串例子
```
swig.setFilter('json', function (oldVal) {
    return JSON.stringify(oldVal);
});
```
配置后点击应用即可在模板中使用
