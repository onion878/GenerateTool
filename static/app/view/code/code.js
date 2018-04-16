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
            jsC.writeFile(this.filePath, this.codeEditor.getValue());
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
        const pId = this.pId;
        this.callParent(arguments);
    }
});