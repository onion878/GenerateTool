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
                contextmenu: false,
                lineDecorationsWidth: '0px',
                scrollBeyondLastLine: false,
                minimap: {
                    enabled: false
                }
            });
            that.codeEditor.onDidChangeModelContent(function (e) {
                that.changeValue();
            });
        },
        click: {
            element: 'el',
            preventDefault: true,
            fn: function (e, target) {
                if ((" " + target.className + " ").replace(/[\n\t]/g, " ").indexOf(" mtku ") > -1) {
                    doSomeThing(target.innerText);
                }

            }
        },
        resize: {
            fn: function (el) {
                this.resizeCode();
            }
        }
    },
    setValue: function (msg) {
        const nowTime = this.getNowTime();
        const m = '[' + nowTime + '] ' + msg;
        Ext.getCmp('msg-bar').infoPanel.innerText = m;
        Ext.getCmp('msg-bar').infoPanel.title = m;
        this.value += m + '\n';
        logger.debug(msg);
        this.codeEditor.setValue(this.value);
        this.codeEditor.revealLine(this.value.split('\n').length);
    },
    clear: function () {
        Ext.getCmp('msg-bar').infoPanel.innerText = '';
        this.codeEditor.setValue('');
        this.value = '';
    },
    initComponent: function () {
        this.callParent(arguments);
    },
    changeValue: function () {

    },
    getNowTime() {
        let date = new Date();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        let hours = date.getHours();
        let min = date.getMinutes();
        let sec = date.getSeconds();
        let code = date.getFullYear() + '-' + toForMatter(month) + '-' +
            toForMatter(day) + ' ' + toForMatter(hours) + ':' + toForMatter(min)
            + ':' + toForMatter(sec);

        function toForMatter(num) {
            if (num < 10) {
                num = "0" + num;
            }
            return num + "";
        }

        return code;
    },
    resizeCode: function () {
        if (this.codeEditor) {
            this.codeEditor.layout();
        }
    }
});
