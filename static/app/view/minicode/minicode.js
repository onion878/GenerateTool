Ext.define('MyAppNamespace.view.minicode.minicode', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.minicode',
    viewModel: true,
    html: `<div class="code-editor-content" style="width: 400px;height: 400px;"></div>`,
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
                value: that.value
            });
            that.codeEditor.onDidChangeModelContent(function (e) {
                that.changeValue();
            });
            that.editorLayout();
        }
    },
    onResize: function () {
        this.editorLayout();
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