const {
    webFrame,
    remote
} = require('electron');
const jsC = require('../service/utils/JscodeUtil');
const logger = require('../service/utils/logger');
const need = require('require-uncached');
let moduleId = null,
    editLabelId = null;
webFrame.setZoomFactor(execute('systemConfig', 'getZoom'));

(function () {
    const _log = console.log;
    const _error = console.error;
    const _warning = console.warning;
    const _debug = console.debug;

    console.debug = function (msg) {
        logger.debug(msg);
        _debug.apply(console, arguments);
    };

    console.error = function (errMessage) {
        logger.error(errMessage);
        _error.apply(console, arguments);
    };

    console.log = function (logMessage) {
        logger.info(logMessage);
        _log.apply(console, arguments);
    };

    console.warning = function (warnMessage) {
        logger.warning(warnMessage);
        _warning.apply(console, arguments);
    };
})();

amdRequire.config({
    paths: {
        'vs': 'vs'
    },
    'vs/nls': {
        availableLanguages: {
            '*': 'zh-cn'
        }
    }
});
amdRequire(['vs/editor/editor.main'], function () {
    console.log('code init success');
    // Register a new language
    monaco.languages.register({id: 'consoleLanguage'});

    // Register a tokens provider for the language
    monaco.languages.setMonarchTokensProvider('consoleLanguage', {
        tokenizer: {
            root: [
                [/\[选择模板]/, "custom-click"],
                [/\[创建模板]/, "custom-click"],
                [/\[查看详情]/, "custom-click"],
                [/\[error.*/, "custom-error"],
                [/\[ERROR.*/, "custom-error"],
                [/Error.*/, "custom-error"],
                [/\[warn.*/, "custom-warn"],
                [/\[WARN.*/, "custom-warn"],
                [/\[info.*/, "custom-info"],
                [/\[INFO.*/, "custom-info"],
                [/\[success.*/, "custom-success"],
                [/\[SUCCESS.*/, "custom-success"],
                [/\[[12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]) (0[1-9]|[0-9]\d|3[01]):(0[1-9]|[0-9]\d|3[01]):(0[1-9]|[0-9]\d|3[01])+\]/, "custom-date"]
            ]
        }
    });

    // Define a new theme that contains only rules that match this language
    monaco.editor.defineTheme('consoleTheme', {
        base: execute('systemConfig', 'getTheme') == 'aria' ? 'vs-dark' : 'vs',
        inherit: true,
        rules: [
            {token: 'custom-click', foreground: '448aff', fontStyle: 'underline'},
            {token: 'custom-info', foreground: '26c6da'},
            {token: 'custom-success', foreground: '2962ff'},
            {token: 'custom-error', foreground: 'ff0000', fontStyle: 'bold'},
            {token: 'custom-warn', foreground: 'FFA500'},
            {token: 'custom-date', foreground: '008800'}
        ]
    });

    // register suggestions
    monaco.languages.registerCompletionItemProvider('javascript', {
        provideCompletionItems: function (model, position) {
            return {
                suggestions: [{
                    label: 'require',
                    kind: monaco.languages.CompletionItemKind.Field,
                    detail: 'require module',
                    insertText: 'require(\'$0\');',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                }, {
                    label: 'getAllData',
                    kind: monaco.languages.CompletionItemKind.Function,
                    detail: 'get set data',
                    insertText: `getAllData()`
                }, {
                    label: 'content',
                    kind: monaco.languages.CompletionItemKind.Variable,
                    detail: '原来值 -- 生效模块: 修改模板',
                    insertText: `content`
                }, {
                    label: 'for',
                    kind: monaco.languages.CompletionItemKind.Constant,
                    detail: 'js 基础循环',
                    insertText: 'for (let ${1:i} = 0; ${1:i} < ${2:rows}.length; ${1:i}++) {\n\tconst ${3:row} = ${2:rows}[${1:i}];\n}',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                }, {
                    label: 'forin',
                    kind: monaco.languages.CompletionItemKind.Constant,
                    detail: 'For-In',
                    insertText: 'for (const key in ${1:object}) {\n\tif (${1:object}.hasOwnProperty(key)) {\n\t\tconst element = ${1:object}[key];\n\t}\n}',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                }, {
                    label: 'exports',
                    kind: monaco.languages.CompletionItemKind.Constant,
                    detail: 'module exports',
                    insertText: 'module.exports = '
                }, {
                    label: 'req',
                    kind: monaco.languages.CompletionItemKind.Function,
                    detail: '引入js脚本 -- 生效模块: JS脚本,从JS脚本取值',
                    insertText: 'req(\'$0\');',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                }, {
                    label: 'swig',
                    kind: monaco.languages.CompletionItemKind.Function,
                    detail: '设置swig过滤器 -- 生效模块: swig配置',
                    insertText: 'swig.setFilter(\'${1:name}\', function (oldVal) {\n\treturn oldVal.toLowerCase();\n});',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                }]
            };
        }
    });

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
                execute('controlData', 'setExtLabel', [editLabelId, value]);
        },
        beforecomplete: function (dom, value, startValue) {
            if (value != startValue) {
                const moduleData = execute('controlData', 'getModuleData', [moduleId]);
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

let reqPath = (module) => {
    return `${jsC.getFolder(moduleId)}/${module}`;
};

//获取已经定义的数据
let getAllData = () => {
    return execute('controlData', 'getModuleData', [moduleId]);
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
    {
        id: "bat",
        text: "bat"
    },
    {
        id: "c",
        text: "c"
    },
    {
        id: "coffeescript",
        text: "coffeescript"
    },
    {
        id: "cpp",
        text: "cpp"
    },
    {
        id: "csharp",
        text: "csharp"
    },
    {
        id: "csp",
        text: "csp"
    },
    {
        id: "css",
        text: "css"
    },
    {
        id: "dockerfile",
        text: "dockerfile"
    },
    {
        id: "fsharp",
        text: "fsharp"
    },
    {
        id: "go",
        text: "go"
    },
    {
        id: "handlebars",
        text: "handlebars"
    },
    {
        id: "html",
        text: "html"
    },
    {
        id: "ini",
        text: "ini"
    },
    {
        id: "java",
        text: "java"
    },
    {
        id: "javascript",
        text: "javascript"
    },
    {
        id: "json",
        text: "json"
    },
    {
        id: "less",
        text: "less"
    },
    {
        id: "lua",
        text: "lua"
    },
    {
        id: "markdown",
        text: "markdown"
    },
    {
        id: "msdax",
        text: "msdax"
    },
    {
        id: "mysql",
        text: "mysql"
    },
    {
        id: "objective-c",
        text: "objective-c"
    },
    {
        id: "pgsql",
        text: "pgsql"
    },
    {
        id: "php",
        text: "php"
    },
    {
        id: "plaintext",
        text: "plaintext"
    },
    {
        id: "postiats",
        text: "postiats"
    },
    {
        id: "powershell",
        text: "powershell"
    },
    {
        id: "pug",
        text: "pug"
    },
    {
        id: "python",
        text: "python"
    },
    {
        id: "r",
        text: "r"
    },
    {
        id: "razor",
        text: "razor"
    },
    {
        id: "redis",
        text: "redis"
    },
    {
        id: "redshift",
        text: "redshift"
    },
    {
        id: "ruby",
        text: "ruby"
    },
    {
        id: "rust",
        text: "rust"
    },
    {
        id: "sb",
        text: "sb"
    },
    {
        id: "scss",
        text: "scss"
    },
    {
        id: "sol",
        text: "sol"
    },
    {
        id: "sql",
        text: "sql"
    },
    {
        id: "st",
        text: "st"
    },
    {
        id: "swift",
        text: "swift"
    },
    {
        id: "typescript",
        text: "typescript"
    },
    {
        id: "vb",
        text: "vb"
    },
    {
        id: "xml",
        text: "xml"
    },
    {
        id: "yaml",
        text: "yaml"
    }
];

const AllSuggestion = {};

let registerAllSuggestion = () => {
    const d = getAllData();
    for (let key in d) {
        const v = d[key],
            suggestions = {};
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
    monaco.languages.registerCompletionItemProvider('javascript', {
        provideCompletionItems: function (model, position) {
            return {
                suggestions: s
            };
        }
    });
};

let getFileIcon = (file) => {
    let name = $icons[file];
    if (name == undefined) {
        name = $icons[file.split('.').pop()];
        if (name == undefined) {
            name = 'file';
        }
    }
    return `./icons/${name}.svg`;
};

let getFileLanguage = (file) => {
    return $icons[file.split('.').pop()];
};

const $icons = {
    "html": "html",
    "htm": "html",
    "xhtml": "html",
    "html_vm": "html",
    "asp": "html",
    "jade": "pug",
    "pug": "pug",
    "md": "markdown",
    "markdown": "markdown",
    "rst": "markdown",
    "blink": "blink",
    "css": "css",
    "scss": "sass",
    "sass": "sass",
    "less": "less",
    "json": "json",
    "package.json": "nodejs",
    "package-lock.json": "nodejs",
    "jinja": "jinja",
    "jinja2": "jinja",
    "j2": "jinja",
    "sublime-project": "sublime",
    "sublime-workspace": "sublime",
    "yaml": "yaml",
    "YAML-tmLanguage": "yaml",
    "yml": "yaml",
    "xml": "xml",
    "plist": "xml",
    "xsd": "xml",
    "dtd": "xml",
    "xsl": "xml",
    "xslt": "xml",
    "resx": "xml",
    "iml": "xml",
    "xquery": "xml",
    "tmLanguage": "xml",
    "manifest": "xml",
    "project": "xml",
    "png": "image",
    "jpeg": "image",
    "jpg": "image",
    "gif": "image",
    "svg": "image",
    "ico": "image",
    "tif": "image",
    "tiff": "image",
    "psd": "image",
    "psb": "image",
    "ami": "image",
    "apx": "image",
    "bmp": "image",
    "bpg": "image",
    "brk": "image",
    "cur": "image",
    "dds": "image",
    "dng": "image",
    "exr": "image",
    "fpx": "image",
    "gbr": "image",
    "img": "image",
    "jbig2": "image",
    "jb2": "image",
    "jng": "image",
    "jxr": "image",
    "pbm": "image",
    "pgf": "image",
    "pic": "image",
    "raw": "image",
    "webp": "image",
    "eps": "image",
    "js": "javascript",
    "esx": "javascript",
    "mjs": "javascript",
    "jsx": "react",
    "tsx": "react_ts",
    "action.js": "redux-action",
    "actions.js": "redux-action",
    "action.ts": "redux-action",
    "actions.ts": "ngrx-actions",
    "reducer.js": "redux-reducer",
    "reducers.js": "redux-reducer",
    "reducer.ts": "ngrx-reducer",
    "reducers.ts": "redux-reducer",
    "store.js": "redux-store",
    "store.ts": "redux-store",
    "ini": "settings",
    "dlc": "settings",
    "dll": "settings",
    "config": "settings",
    "conf": "settings",
    "properties": "settings",
    "prop": "settings",
    "settings": "settings",
    "option": "settings",
    "props": "settings",
    "toml": "settings",
    "prefs": "settings",
    "sln.dotsettings": "settings",
    "sln.dotsettings.user": "settings",
    "cfg": "settings",
    "ts": "typescript",
    "d.ts": "typescript-def",
    "marko": "markojs",
    "pdf": "pdf",
    "xlsx": "table",
    "xls": "table",
    "csv": "table",
    "tsv": "table",
    "vscodeignore": "vscode",
    "vsixmanifest": "vscode",
    "vsix": "vscode",
    "code-workplace": "vscode",
    "csproj": "visualstudio",
    "ruleset": "visualstudio",
    "sln": "visualstudio",
    "suo": "visualstudio",
    "vb": "visualstudio",
    "vbs": "visualstudio",
    "vcxitems": "visualstudio",
    "vcxitems.filters": "visualstudio",
    "vcxproj": "visualstudio",
    "vcxproj.filters": "visualstudio",
    "pdb": "database",
    "sql": "database",
    "pks": "database",
    "pkb": "database",
    "accdb": "database",
    "mdb": "database",
    "sqlite": "database",
    "pgsql": "database",
    "postgres": "database",
    "psql": "database",
    "cs": "csharp",
    "csx": "csharp",
    "zip": "zip",
    "tar": "zip",
    "gz": "zip",
    "xz": "zip",
    "bzip2": "zip",
    "gzip": "zip",
    "7z": "zip",
    "rar": "zip",
    "tgz": "zip",
    "exe": "exe",
    "msi": "exe",
    "java": "java",
    "jar": "java",
    "jsp": "java",
    "c": "c",
    "m": "c",
    "h": "h",
    "cc": "cpp",
    "cpp": "cpp",
    "mm": "cpp",
    "cxx": "cpp",
    "hpp": "hpp",
    "go": "go",
    "py": "python",
    "pyc": "python-misc",
    "whl": "python-misc",
    "url": "url",
    "sh": "console",
    "ksh": "console",
    "csh": "console",
    "tcsh": "console",
    "zsh": "console",
    "bash": "console",
    "bat": "console",
    "cmd": "console",
    "awk": "console",
    "fish": "console",
    "ps1": "powershell",
    "psm1": "powershell",
    "psd1": "powershell",
    "ps1xml": "powershell",
    "psc1": "powershell",
    "pssc": "powershell",
    "gradle": "gradle",
    "doc": "word",
    "docx": "word",
    "rtf": "word",
    "cer": "certificate",
    "cert": "certificate",
    "crt": "certificate",
    "pub": "key",
    "key": "key",
    "pem": "key",
    "asc": "key",
    "gpg": "key",
    "woff": "font",
    "woff2": "font",
    "ttf": "font",
    "eot": "font",
    "suit": "font",
    "otf": "font",
    "bmap": "font",
    "fnt": "font",
    "odttf": "font",
    "ttc": "font",
    "font": "font",
    "fonts": "font",
    "sui": "font",
    "ntf": "font",
    "mrf": "font",
    "lib": "lib",
    "bib": "lib",
    "rb": "ruby",
    "erb": "ruby",
    "fs": "fsharp",
    "fsx": "fsharp",
    "fsi": "fsharp",
    "fsproj": "fsharp",
    "swift": "swift",
    "ino": "arduino",
    "dockerignore": "docker",
    "dockerfile": "docker",
    "tex": "tex",
    "cls": "tex",
    "sty": "tex",
    "pptx": "powerpoint",
    "ppt": "powerpoint",
    "pptm": "powerpoint",
    "potx": "powerpoint",
    "potm": "powerpoint",
    "ppsx": "powerpoint",
    "ppsm": "powerpoint",
    "pps": "powerpoint",
    "ppam": "powerpoint",
    "ppa": "powerpoint",
    "webm": "video",
    "mkv": "video",
    "flv": "video",
    "vob": "video",
    "ogv": "video",
    "ogg": "video",
    "gifv": "video",
    "avi": "video",
    "mov": "video",
    "qt": "video",
    "wmv": "video",
    "yuv": "video",
    "rm": "video",
    "rmvb": "video",
    "mp4": "video",
    "m4v": "video",
    "mpg": "video",
    "mp2": "video",
    "mpeg": "video",
    "mpe": "video",
    "mpv": "video",
    "m2v": "video",
    "vdi": "virtual",
    "vbox": "virtual",
    "vbox-prev": "virtual",
    "ics": "email",
    "mp3": "audio",
    "flac": "audio",
    "m4a": "audio",
    "wma": "audio",
    "aiff": "audio",
    "coffee": "coffee",
    "txt": "document",
    "graphql": "graphql",
    "gql": "graphql",
    "rs": "rust",
    "raml": "raml",
    "xaml": "xaml",
    "hs": "haskell",
    "kt": "kotlin",
    "kts": "kotlin",
    "patch": "git",
    "lua": "lua",
    "clj": "clojure",
    "cljs": "clojure",
    "groovy": "groovy",
    "r": "r",
    "rmd": "r",
    "dart": "dart",
    "as": "actionscript",
    "mxml": "mxml",
    "ahk": "autohotkey",
    "swf": "flash",
    "swc": "swc",
    "cmake": "cmake",
    "asm": "assembly",
    "a51": "assembly",
    "inc": "assembly",
    "nasm": "assembly",
    "s": "assembly",
    "ms": "assembly",
    "agc": "assembly",
    "ags": "assembly",
    "aea": "assembly",
    "argus": "assembly",
    "mitigus": "assembly",
    "binsource": "assembly",
    "vue": "vue",
    "ml": "ocaml",
    "mli": "ocaml",
    "cmx": "ocaml",
    "js.map": "javascript-map",
    "mjs.map": "javascript-map",
    "css.map": "css-map",
    "lock": "lock",
    "hbs": "handlebars",
    "mustache": "handlebars",
    "pl": "perl",
    "pm": "perl",
    "hx": "haxe",
    "spec.ts": "test-ts",
    "test.ts": "test-ts",
    "ts.snap": "test-ts",
    "spec.tsx": "test-jsx",
    "test.tsx": "test-jsx",
    "tsx.snap": "test-jsx",
    "spec.jsx": "test-jsx",
    "test.jsx": "test-jsx",
    "jsx.snap": "test-jsx",
    "spec.js": "test-js",
    "test.js": "test-js",
    "js.snap": "test-js",
    "module.ts": "angular",
    "module.js": "angular",
    "ng-template": "angular",
    "component.ts": "angular-component",
    "component.js": "angular-component",
    "guard.ts": "angular-guard",
    "guard.js": "angular-guard",
    "service.ts": "angular-service",
    "service.js": "angular-service",
    "pipe.ts": "angular-pipe",
    "pipe.js": "angular-pipe",
    "filter.js": "angular-pipe",
    "directive.ts": "angular-directive",
    "directive.js": "angular-directive",
    "resolver.ts": "angular-resolver",
    "resolver.js": "angular-resolver",
    "pp": "puppet",
    "ex": "elixir",
    "exs": "elixir",
    "eex": "elixir",
    "ls": "livescript",
    "erl": "erlang",
    "twig": "twig",
    "jl": "julia",
    "elm": "elm",
    "pure": "purescript",
    "purs": "purescript",
    "tpl": "smarty",
    "styl": "stylus",
    "re": "reason",
    "rei": "reason",
    "cmj": "bucklescript",
    "merlin": "merlin",
    "v": "verilog",
    "vhd": "verilog",
    "sv": "verilog",
    "svh": "verilog",
    "nb": "mathematica",
    "wl": "wolframlanguage",
    "wls": "wolframlanguage",
    "njk": "nunjucks",
    "nunjucks": "nunjucks",
    "robot": "robot",
    "sol": "solidity",
    "au3": "autoit",
    "haml": "haml",
    "yang": "yang",
    "mjml": "mjml",
    "tf": "terraform",
    "tf.json": "terraform",
    "tfvars": "terraform",
    "tfstate": "terraform",
    "blade.php": "laravel",
    "inky.php": "laravel",
    "applescript": "applescript",
    "cake": "cake",
    "feature": "cucumber",
    "nim": "nim",
    "nimble": "nim",
    "apib": "apiblueprint",
    "apiblueprint": "apiblueprint",
    "tag": "riot",
    "vfl": "vfl",
    "kl": "kl",
    "pcss": "postcss",
    "sss": "postcss",
    "todo": "todo",
    "cfml": "coldfusion",
    "cfc": "coldfusion",
    "lucee": "coldfusion",
    "cfm": "coldfusion",
    "cabal": "cabal",
    "nix": "nix",
    "slim": "slim",
    "http": "http",
    "rest": "http",
    "rql": "restql",
    "restql": "restql",
    "kv": "kivy",
    "graphcool": "graphcool",
    "sbt": "sbt",
    "rootReducer.ts": "ngrx-reducer",
    "state.ts": "ngrx-state",
    "effects.ts": "ngrx-effects",
    "cr": "crystal",
    "drone.yml": "drone",
    "cu": "cuda",
    "cuh": "cuda",
    "log": "log",
    "def": "dotjs",
    "dot": "dotjs",
    "jst": "dotjs",
    "ejs": "ejs",
    ".wakatime-project": "wakatime",
    "pde": "processing",
    "stories.js": "storybook",
    "stories.jsx": "storybook",
    "story.js": "storybook",
    "story.jsx": "storybook",
    "stories.ts": "storybook",
    "stories.tsx": "storybook",
    "story.ts": "storybook",
    "story.tsx": "storybook",
    "wpy": "wepy",
    "hcl": "hcl",
    "san": "san",
    "djt": "django",
    "red": "red",
    "fxp": "foxpro",
    "prg": "foxpro",
    "pot": "i18n",
    "po": "i18n",
    "mo": "i18n",
    "wat": "webassembly",
    "wasm": "webassembly",
    "ipynb": "jupyter",
    "d": "d",
    "mdx": "mdx",
    "bal": "ballerina",
    "balx": "ballerina",
    "rkt": "racket",
    "bzl": "bazel",
    "bazel": "bazel",
    "mint": "mint",
    "vm": "velocity",
    "fhtml": "velocity",
    "vtl": "velocity",
    "gd": "godot",
    "godot": "godot-assets",
    "tres": "godot-assets",
    "tscn": "godot-assets",
    "azcli": "azure",
    "vagrantfile": "vagrant",
    "prisma": "prisma",
    "cshtml": "razor",
    "vbhtml": "razor",
    "ad": "asciidoc",
    "adoc": "asciidoc",
    "asciidoc": "asciidoc",
    "edge": "edge"
};

const ipc = require('electron').ipcRenderer;

ipc.on('runNode', (event, message) => {
    console.log(message);
    showToast(message);
});

ipc.on('runNodeErr', (event, message) => {
    closeNodeWin();
    showError('[error] 出现了错误, 请检查您的脚本, 错误信息如下:');
    showError('[error] ' + JSON.stringify(message));
    showToast('查看完整日志: [查看详情]');
    Ext.getCmp('main-content').unmask();
    remote.getCurrentWindow().setProgressBar(-1);
    new Notification('[GenerateTool]错误', {
        body: `出现了错误, 错误信息:${message}`,
        icon: './images/error.png'
    });
    showErrorFlag();
});

let runWin = null;

const nodeRun = (content) => {
    if (runWin == null) {
        const {BrowserWindow, getCurrentWindow} = require('electron').remote;
        runWin = new BrowserWindow({
            webPreferences: {
                nodeIntegration: true
            },
            parent: getCurrentWindow(),
            show: false,
            width: 200,
            height: 200
        });
        runWin.loadURL(`file://${__dirname}/render.html`);
    }
    return runWin.webContents.executeJavaScript(content);
};

const closeNodeWin = () => {
    try {
        runWin.close();
    } catch (e) {

    }
    runWin = null;
};

String.prototype.encodeHtml = function () {
    let html = this;
    let temp = document.createElement("div");
    (temp.textContent != null) ? (temp.textContent = html) : (temp.innerText = html);
    const output = temp.innerHTML;
    temp = null;
    return output;
};

function login(call) {
    const {Password, UserName} = execute('userConfig', 'getUser');
    Ext.create('Ext.window.Window', {
        title: '登录',
        width: 320,
        modal: true,
        items: [{
            bodyPadding: 8,
            defaultType: 'textfield',
            xtype: 'form',
            layout: {
                type: 'vbox',
                pack: 'start',
                align: 'stretch'
            },
            items: [{
                allowBlank: false,
                fieldLabel: '用户名',
                name: 'UserName',
                flex: 1,
                emptyText: '用户名',
                value: UserName
            }, {
                allowBlank: false,
                fieldLabel: '密码',
                name: 'Password',
                emptyText: '密码',
                flex: 1,
                inputType: 'password',
                value: Password
            }],
        }],
        buttons: [
            {
                text: '登录',
                handler: function (btn) {
                    var form = btn.up('window').down('form');
                    if (form.isValid()) {
                        Ext.Ajax.request({
                            url: execute('userConfig', 'getUrl') + '/login',
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            jsonData: form.getValues(),
                            success: function (response) {
                                const jsonResp = Ext.util.JSON.decode(response.responseText);
                                execute('userConfig', 'setAuth', [jsonResp.token]);
                                execute('userConfig', 'setUser', [form.getValues()]);
                                btn.up('window').close();
                                if (call) {
                                    call(jsonResp.token);
                                }
                            },
                            failure: function (response) {
                                Ext.MessageBox.show({
                                    title: '错误',
                                    msg: '用户名或密码错误',
                                    buttons: Ext.MessageBox.OK,
                                    icon: Ext.MessageBox['ERROR']
                                });
                            }
                        });
                    }
                }
            }
        ]
    }).show().focus();
}
