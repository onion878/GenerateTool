Ext.define('MyAppNamespace.view.minicode.minicode', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.minicode',
    viewModel: true,
    html: `<div class="code-editor-content" style="width: 100%;height: 100%;"></div>`,
    layout: 'fit',
    value: null,
    codeEditor: null,
    listeners: {
        render: function (c) {
            const {
                dom
            } = this.getEl().down('.code-editor-content'), that = this;
            that.language = that.language != undefined ? that.language : 'javascript';
            that.fileContent = that.fileContent != undefined ? that.fileContent : '';
            that.codeEditor = monaco.editor.create(dom, {
                language: that.language,
                value: that.value,
                minimap: {
                    enabled: false
                },
                automaticLayout: true
            });
            that.codeEditor.onDidChangeModelContent(function (e) {
                that.changeValue();
            });
        }
    },
    initComponent: function () {
        this.callParent(arguments);
    },
    changeValue: function () {

    },
    updateLanguage(val, language) {
        const oldModel = this.codeEditor.getModel();
        const newModel = monaco.editor.createModel(val, language);
        this.codeEditor.setModel(newModel);
        if (oldModel) {
            oldModel.dispose();
        }
    },
    updateTheme(theme) {
        const newTheme = (theme === 1 ? 'vs-dark' : (theme === 0 ? 'vs' : 'hc-black'));
        monaco.editor.setTheme(newTheme);
    }
});
