Ext.define('OnionSpace.view.diffcode.diffcode', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.diffcode',
    requires: [
        'OnionSpace.controller.Diffcode'
    ],
    controller: 'Diffcode',
    viewModel: true,
    html: `<div class="code-diff-content" style="width: 100%;height: 100%;"></div>`,
    layout: 'fit',
    codeEditor: null,
    listeners: {
        render: function (c) {
            const {
                dom
            } = this.getEl().down('.code-diff-content'), that = this;
            that.language = that.language != undefined ? that.language : 'javascript';
            that.codeEditor = monaco.editor.createDiffEditor(dom, {
                enableSplitViewResizing: false,
                renderSideBySide: false,
                language: that.language,
                readOnly: true
            });
        },
        resize: {
            fn: function (el) {
                this.resizeCode();
            }
        }
    },
    initComponent: function () {
        this.callParent(arguments);
    },
    resizeCode: function () {
        if (this.codeEditor) {
            this.codeEditor.layout();
        }
    },
    changeValue(newValue, oldValue) {
        this.codeEditor.setModel({
            original: monaco.editor.createModel(oldValue, this.language),
            modified: monaco.editor.createModel(newValue, this.language)
        });
    }
});
