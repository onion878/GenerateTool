## 说明
[1]*模板生成使用的是swig进行渲染,文档:`https://github.com/paularmstrong/swig`*<br>
[2]*模板修改采用js进行修改,修改后返回一个新的字符串*
## 生成java实体类例子
```
package {{pojoPackage}}.{{serviceType}};

import java.util.Date;
import javax.persistence.*;
import java.math.BigDecimal;
import java.io.Serializable;
import com.fasterxml.jackson.annotation.JsonFormat;

/**
 * Created by {{userName}} on {{Date()|now}}
 */
@Table(name = "{{tableName}}")
public class {{entityName}} implements Serializable {
    {% for field in fields %}
    {%- if field.type=='Date' -%}    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    {%- endif -%}
    {%- if field.name=='id' -%}
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY, generator = "select uuid()")
    {%- else -%}
    @Column(name = "{{field.field}}")
    {%- endif -%}
    @DataExportAnnotation("{{field.title}}")
    private {{field.type}} {{ field.name }};
    
    {% endfor %}
    {%- for f in fieldName %}
    @Transient
    private String {{f.name}};
    {% endfor %}
    {%- for field in fields %}
    /**
     * @return {{field.name}}
     */
    public {{field.type}} get{{(field.name).substring(0,1).toUpperCase() + (field.name).substring(1)}}() {
        return {{field.name}};
    }

    /**
     * @param {{field.name}}
     */
    public void set{{(field.name).substring(0,1).toUpperCase() + (field.name).substring(1)}}({{field.type}} {{field.name}}) {
        {% if field.type=='String' %}this.{{field.name}} = {{field.name}} == null ? null : {{field.name}}.trim();{% else %}this.{{field.name}} = {{field.name}};{% endif %}
    }
    {% endfor %}

    {%- for f in fieldName %}
    /**
     * @return {{f.name}}
     */
    public String get{{(f.name).substring(0,1).toUpperCase() + (f.name).substring(1)}}() {
        return {{f.name}};
    }

    /**
     * @param {{f.name}}
     */
    public void set{{(f.name).substring(0,1).toUpperCase() + (f.name).substring(1)}}(String {{f.name}}) {
        this.{{f.name}} = {{f.name}} == null ? null : {{f.name}}.trim();
    }
    {% endfor %}
}
```

- 其中用双大括号的变量为模板数据中定义的值

## 修改模板例子
```
 const {entityName, serviceType} = getAllData();
 module.exports = content + entityName;
```

- 其中第一行的`getAllData()`是获取定义的模板数据的内置方法
- 第二行的`content`是获取文件的原内容, 采用node的方式返回最终结果
