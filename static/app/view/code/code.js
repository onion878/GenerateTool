Ext.define('OnionSpace.view.code.code', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.code',
    requires: [
        'OnionSpace.controller.Code'
    ],
    controller: 'Code',
    viewModel: true,
    html: `<div class="code-editor-content" style="width: 100%;height: 100%;"></div>`,
    layout: 'fit',
    codeEditor: null,
    listeners: {
        render: function (c) {
            const {dom} = this.getEl().down('.code-editor-content'), that = this;
            that.fileContent = that.fileContent != undefined ? that.fileContent : '';
            that.codeEditor = monaco.editor.create(dom, {
                value: that.fileContent,
                language: that.language
            });
            that.codeEditor.onDidChangeModelContent(function (e) {
                that.writeValue();
            });
        },
        resize: {
            fn: function(el) {
                this.resizeCode();
            }
        }
    },
    writeValue: function () {
        if (this.filePath != undefined && this.filePath != null && this.filePath != '') {
            const val = this.codeEditor.getValue();
            jsC.writeFile(this.filePath, val);
            execute('history', 'setCode', [{id: this.id, fileContent: val}]);
        }
    },
    initComponent: function () {
        const pId = this.pId, that = this;
        that.language = that.language != undefined ? that.language : getFileLanguage(that.filePath);
        if (that.language == 'javascript') {
            this.tbar = {
                xtype: 'statusbar',
                pId: pId,
                list: [{img: './images/play.svg', name: 'Run'}, {img: './images/help.svg', name: 'Help'}],
                float: 'left',
                click: function (tbar, d, n) {
                    if (n == 'Run') {
                        that.runTest(pId, that.title);
                    } else {
                        showHelpFile('js脚本/code.md', '数据脚本', d);
                    }
                }
            };
        }
        this.callParent(arguments);
    },
    runTest(pId, file) {
        if (Ext.getCmp('terminal').hidden) {
            document.getElementById('terminal-btn').click();
            const folder = jsCode.getFolder(pId);
            command.cdTargetFolder(folder);
            command.write(`node -p "require('./${file}')"`);
        } else {
            command.write(`node -p "require('./${file}')"`);
        }
    },
    resizeCode: function () {
        if (this.codeEditor) {
            this.codeEditor.layout();
        }
    }
});
