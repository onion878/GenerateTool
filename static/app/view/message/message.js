Ext.define('OnionSpace.view.message.message', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.message',
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
            that.codeEditor.onDidChangeModelContent(function (e) {
                that.changeValue();
            });
        }
    },
    setValue: function (msg) {
        const nowTime = this.getNowTime();
        Ext.getCmp('msg-bar').infoPanel.innerHTML = '[' + nowTime + '] ' + msg;
        this.value += '[' + nowTime + '] ' + msg + '\n';
        this.codeEditor.setValue(this.value);
        this.codeEditor.revealLine(this.value.split('\n').length);
    },
    clear: function () {
        Ext.getCmp('msg-bar').infoPanel.innerHTML = '';
        this.codeEditor.setValue('');
        this.value = '';
    },
    initComponent: function () {
        this.callParent(arguments);
    },
    changeValue: function () {

    },
    getNowTime() {
        var date = new Date();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var hours = date.getHours();
        var min = date.getMinutes();
        var sec = date.getSeconds();
        var code = date.getFullYear() + '-' + toForMatter(month) + '-' +
            toForMatter(day) + ' ' + toForMatter(hours) + ':' + toForMatter(min)
            + ':' + toForMatter(sec);

        function toForMatter(num) {
            if (num < 10) {
                num = "0" + num;
            }
            return num + "";
        }

        return code;
    }
});
