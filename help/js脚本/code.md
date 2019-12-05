## 说明
*采用nodejs返回脚本*
## 返回说明
- **[文本、多行文本、代码块、文件、文件夹]: 返回string**<br>
- **[单选]: 返回对象,如:{value: 'Map<String, Object>',data: [{"id": "Map<String, Object>", "text": "Map<String, Object>"}]}**<br>
- **[单一集合]: 返回单一数组对象,如: ['Google', 'Microsoft', 'Apple']**<br>
- **[JSON数据]: 返回单一对象,如: {name: 'Google'}**<br>
- **[表格数据]: 返回集合对象,如: [{name: 'Google'}]**<br>

## 返回定义
**数据**: 如：module.exports = {name: 'Google'}<br>
**异步方法**: 如：module.exports = async () => { ... }
## 表格数据说明
表格如果要在返回中添加操作按钮：可以返回如下数据：<br>
```
[
  {
    "name": "Test",
    "操作": {
      "width": 80,
      "html": `<i onclick="eval(req('tools').openFile('${file}'))" title="打开" style="cursor: pointer" class="far fa-edit"></i>`
    }
  }
]
```
[1] 其中如果返回的key是[操作]那么就可以定义内容为{width,html}的json对象,其中req是内置的可以调用js脚本。<br/>
[2] 其中的图标采用了font awesome 5的免费版本文档:`https://fontawesome.com/icons?d=gallery&m=free`<br/>
