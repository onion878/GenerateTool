const jsC = require('../service/utils/JscodeUtil');
const need = require('require-uncached');
let moduleId = null;
amdRequire.config({
    paths: {'vs': 'vs'}, 'vs/nls': {
        availableLanguages: {
            '*': 'zh-cn'
        }
    }
});
amdRequire(['vs/editor/editor.main'], function () {
    console.log('code init success');
});

const labelEditor = new Ext.Editor({
    updateEl: true,
    alignment: 'l-l',
    width: 100,
    allowBlank: false,
    field: {
        xtype: 'textfield'
    }
});
//创建无缓存node模块
let req = (module) => {
    return need(`${jsC.getFolder(moduleId)}/${module}`);
};