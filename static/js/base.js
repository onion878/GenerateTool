const jsC = require('../service/utils/JscodeUtil');
const need = require('require-uncached');

let vsEditor, jsFile = null, moduleId = null;

amdRequire.config({
    paths: {'vs': 'vs'}, 'vs/nls': {
        availableLanguages: {
            '*': 'zh-cn'
        }
    }
});

amdRequire(['vs/editor/editor.main'], function () {
    vsEditor = monaco.editor.create(document.getElementById('vscode-container'), {
        value: '',
        language: 'javascript'
    });
    vsEditor.onDidChangeModelContent(function (e) {
        jsC.writeFile(jsFile, vsEditor.getValue());
    });
});

let vsLayout = () => {
    const dom = document.getElementById('vscode-container');
    const parent = Ext.get('vscode-container').getParent();
    const height = parent.getHeight();
    const width = parent.getWidth();
    dom.style.height = height + 'px';
    dom.style.width = width + 'px';
    vsEditor.layout();
};

let vsReset = () => {
    Ext.get('vscode-body').append(Ext.get('vscode-container'));
};

//创建无缓存node模块
let req = (module) => {
    return need(`${jsC.getFolder(moduleId)}/${module}`);
};