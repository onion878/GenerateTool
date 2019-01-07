const {webFrame} = require('electron');
const jsC = require('../service/utils/JscodeUtil');
const need = require('require-uncached');
let moduleId = null, editLabelId = null;
webFrame.setZoomFactor(systemConfig.getZoom());

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
    },
    listeners: {
        complete: function (dom, value, startValue, eOpts) {
            if (value != startValue)
                controlData.setExtLabel(editLabelId, value);
        },
        beforecomplete: function (dom, value, startValue) {
            if (value != startValue) {
                const moduleData = controlData.getModuleData(moduleId);
                if (moduleData[value] != undefined) {
                    showToast(`已存在[${value}]!`);
                    return false;
                }
                if (value.trim().length == 0) {
                    showToast(`值不能为空!`);
                    return false;
                }
            }
        }
    }
});
//创建无缓存node模块
let req = (module) => {
    return need(`${jsC.getFolder(moduleId)}/${module}`);
};

//获取已经定义的数据
let getAllData = () => {
    return controlData.getModuleData(moduleId);
};

const getUUID = () => {
    let d = new Date().getTime();
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });
    return uuid;
};

const languageType = [
    {id: "bat", text: "bat"},
    {id: "c", text: "c"},
    {id: "coffeescript", text: "coffeescript"},
    {id: "cpp", text: "cpp"},
    {id: "csharp", text: "csharp"},
    {id: "csp", text: "csp"},
    {id: "css", text: "css"},
    {id: "dockerfile", text: "dockerfile"},
    {id: "fsharp", text: "fsharp"},
    {id: "go", text: "go"},
    {id: "handlebars", text: "handlebars"},
    {id: "html", text: "html"},
    {id: "ini", text: "ini"},
    {id: "java", text: "java"},
    {id: "javascript", text: "javascript"},
    {id: "json", text: "json"},
    {id: "less", text: "less"},
    {id: "lua", text: "lua"},
    {id: "markdown", text: "markdown"},
    {id: "msdax", text: "msdax"},
    {id: "mysql", text: "mysql"},
    {id: "objective-c", text: "objective-c"},
    {id: "pgsql", text: "pgsql"},
    {id: "php", text: "php"},
    {id: "plaintext", text: "plaintext"},
    {id: "postiats", text: "postiats"},
    {id: "powershell", text: "powershell"},
    {id: "pug", text: "pug"},
    {id: "python", text: "python"},
    {id: "r", text: "r"},
    {id: "razor", text: "razor"},
    {id: "redis", text: "redis"},
    {id: "redshift", text: "redshift"},
    {id: "ruby", text: "ruby"},
    {id: "rust", text: "rust"},
    {id: "sb", text: "sb"},
    {id: "scss", text: "scss"},
    {id: "sol", text: "sol"},
    {id: "sql", text: "sql"},
    {id: "st", text: "st"},
    {id: "swift", text: "swift"},
    {id: "typescript", text: "typescript"},
    {id: "vb", text: "vb"},
    {id: "xml", text: "xml"},
    {id: "yaml", text: "yaml"}
];

const AllSuggestion = {};

let registerAllSuggestion = () => {
    const d = getAllData();
    for (let key in d) {
        const v = d[key], suggestions = {};
        if (typeof v == "object") {
            if (v instanceof Array) {
                suggestions[key] = `ArrayJSON: ${key}`;
                if (v.length > 0) {
                    for (let k in v[0]) {
                        suggestions[k] = `ArrayJSON: ${key} -> ${k}`;
                    }
                }
            } else {
                suggestions[key] = `JSON: ${key}`;
                for (let k in v) {
                    suggestions[k] = `JSON: ${key} -> ${k}`;
                }
            }
        } else {
            suggestions[key] = `String: ${key}`;
        }
        registerSingleData(suggestions);
    }
    monaco.languages.registerCompletionItemProvider('javascript', {
        provideCompletionItems: function (model, position) {
            return {
                suggestions: [
                    {
                        label: 'require',
                        kind: monaco.languages.CompletionItemKind.Field,
                        detail: 'require module',
                        insertText: `require('')`
                    }, {
                        label: 'getAllData',
                        kind: monaco.languages.CompletionItemKind.Function,
                        detail: 'get set data',
                        insertText: `getAllData()`
                    }, {
                        label: 'content',
                        kind: monaco.languages.CompletionItemKind.Variable,
                        detail: 'origin content',
                        insertText: `content`
                    }
                ]
            };
        }
    });
};

let registerSingleData = (suggestions) => {
    const s = [];
    for (let k in suggestions) {
        let flag = false;
        if (AllSuggestion[k]) {
            AllSuggestion[k].some(a => {
                if (a == suggestions[k]) {
                    flag = true;
                    return flag;
                }
            });
            if (!flag) {
                AllSuggestion[k].push([suggestions[k]]);
                s.push({
                    label: k,
                    kind: monaco.languages.CompletionItemKind.Enum,
                    detail: suggestions[k],
                    insertText: k
                });
            }
        } else {
            AllSuggestion[k] = [suggestions[k]];
            s.push({
                label: k,
                kind: monaco.languages.CompletionItemKind.Field,
                detail: suggestions[k],
                insertText: k
            });
        }
    }
    languageType.forEach(lan => {
        monaco.languages.registerCompletionItemProvider(lan.id, {
            provideCompletionItems: function (model, position) {
                return {
                    suggestions: s
                };
            }
        });
    });
};

let setZoom = (type) => {
    const old = webFrame.getZoomFactor();
    if (type == '+') {
        const val = old + 0.1;
        systemConfig.setZoom(val);
        webFrame.setZoomFactor(val);
    } else {
        const val = old - 0.1;
        systemConfig.setZoom(val);
        webFrame.setZoomFactor(val);
    }
};

let resetZoom = () => {
    webFrame.setZoomFactor(1);
    systemConfig.setZoom(1);
};