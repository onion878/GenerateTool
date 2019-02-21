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
                lineDecorationsWidth: '0px',
                scrollBeyondLastLine: false,
                minimap: {
                    enabled: false
                },
                automaticLayout: true
            });
            that.codeEditor.addAction({
                id: 'refresh-action',
                label: '刷新日志',
                keybindings: [
                    monaco.KeyCode.F5
                ],
                precondition: null,
                keybindingContext: null,
                contextMenuGroupId: 'navigation',
                contextMenuOrder: 0,
                run: function(ed) {
                    that.setValue(logger.readValue());
                    return null;
                }
            });
            that.codeEditor.addAction({
                id: 'clear-action',
                label: '清空日志',
                keybindings: [
                    monaco.KeyMod.CtrlCmd | monaco.KeyCode.Delete
                ],
                precondition: null,
                keybindingContext: null,
                contextMenuGroupId: 'navigation',
                contextMenuOrder: 1,
                run: function(ed) {
                    logger.clear();
                    that.setValue(logger.readValue());
                    return null;
                }
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
