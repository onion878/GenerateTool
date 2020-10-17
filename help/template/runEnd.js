// 实现文件生成
function writeFile(file, content) {
    const path = require('path');
    try {
        const filePath = path.dirname(file);
        if (!fs.existsSync(filePath)) {
            shell.mkdir('-p', filePath);
        }
        fs.writeFileSync(file, content, 'utf8');
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}

// 执行前脚本
require('./before');
console.info('生成前模板执行成功!')
// 生成模板
const list = [];
templates.forEach(f => {
    const tpl = swig.compile(f.file);
    const file = tpl(data).replace(/\\/g, '\/');
    if (f.type == 'add') {
        const tplPre = swig.compile(f.content);
        list.push({
            content: tplPre(data),
            file: file
        });
    } else {
        const content = `const getAllData = () => require('./data.json');const content = \`${require('fs').readFileSync(file, 'utf8').toString().replace(/\\/g, '\\\\').replace(/\$/g, '\\$').replace(/\`/g, '\\`')}\`;\n` + f.content;
        list.push({
            content: eval(content),
            file: file
        });
    }
});
list.forEach(r => {
    writeFile(r.file, r.content);
    console.info(r.file + "创建成功!");
});
// 执行后脚本
require('./after');
console.info('生成后模板执行成功!')
console.log("执行成功!");
