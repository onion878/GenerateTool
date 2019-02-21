Ext.define('OnionSpace.view.logger.logger', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.logger',
    viewModel: true,
    html: `<div class="code-editor-content" style="width: 100%;height: 100%;"></div>`,
    layout: 'fit',
    value: '',
    codeEditor: null,
    listeners: {
        render: function (c) {
            const {dom} = this.getEl().down('.code-editor-content'), that = this;
            that.codeEditor = monaco.editor.create(dom, {
                language: 'consoleLanguage',
                theme: 'consoleTheme',
                readOnly: true,
                lineNumbers: 'off',
                contextmenu: false,
                lineDecorationsWidth: '0px',
                scrollBeyondLastLine: false,
                minimap: {
                    enabled: false
                },
                automaticLayout: true
            });
            that.setValue(logger.readValue());
        }
    },
    setValue: function (msg) {
        this.codeEditor.setValue(msg);
        this.codeEditor.revealLine(msg.split('\n').length);
    },
    clear: function () {
        this.codeEditor.setValue('');
        this.value = '';
    },
    initComponent: function () {
        this.callParent(arguments);
    }
});
