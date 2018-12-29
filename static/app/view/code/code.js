Ext.define('MyAppNamespace.view.code.code', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.code',
    viewModel: true,
    html: `<div class="code-editor-content" style="width: 400px;height: 400px;"></div>`,
    layout: 'fit',
    codeEditor: null,
    listeners: {
        render: function (c) {
            const {dom} = this.getEl().down('.code-editor-content'), that = this;
            that.language = that.language != undefined ? that.language : 'javascript';
            that.fileContent = that.fileContent != undefined ? that.fileContent : '';
            that.codeEditor = monaco.editor.create(dom, {
                value: that.fileContent,
                language: that.language
            });
            that.codeEditor.onDidChangeModelContent(function (e) {
                that.writeValue();
            });
            that.editorLayout();
        }
    },
    onResize: function () {
        this.editorLayout();
    },
    writeValue: function () {
        if (this.filePath != undefined && this.filePath != null && this.filePath != '') {
            const val = this.codeEditor.getValue();
            jsC.writeFile(this.filePath, val);
            history.setCode({id: this.id, fileContent: val});
        }
    },
    editorLayout: function () {
        const code = this.getEl().down('.code-editor-content');
        const parent = code.getParent();
        const height = parent.getHeight();
        const width = parent.getWidth();
        code.dom.style.height = height + 'px';
        code.dom.style.width = width + 'px';
        this.codeEditor.layout();
    },
    initComponent: function () {
        const pId = this.pId, that = this;
        this.tbar = {
            xtype: 'statusbar',
            pId: pId,
            list: [{img: './images/play_arrow.png', name: 'Run'}],
            float: 'left',
            click: function (tbar, d) {
                that.runTest(pId, that.title);
            }
        };
        this.callParent(arguments);
    },
    runTest(pId, file) {
        if (Ext.getCmp('terminal').hidden) {
            document.getElementById('terminal-btn').click();
            const folder = jsCode.getFolder(pId);
            command.cdTargetFolder(folder);
            command.write('node ' + file);
        } else {
            command.write('node ' + file);
        }
    }
});