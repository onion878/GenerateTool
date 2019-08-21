Ext.define('OnionSpace.view.after-shell.after-shell', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.after-shell',
    requires: [
        'OnionSpace.controller.AfterShell'
    ],
    controller: 'AfterShell',
    layout: 'fit',
    codeEditor: null,
    listeners: {
        render: function (c) {
            const that = this;
            that.codeEditor = Ext.create({
                language: 'javascript',
                value: execute('geFileData', 'getShell', [that.pId]),
                xtype: 'minicode',
                minimap: true
            });
            that.codeEditor.changeValue = function () {
                const val = that.codeEditor.codeEditor.getValue();
                execute('geFileData', 'setShell', [that.pId, val]);
            };
            that.add(that.codeEditor);
        }
    },
    initComponent: function () {
        const that = this;
        this.tbar = {
            xtype: 'statusbar',
            pId: this.pId,
            list: [{img: './images/test.svg', name: 'Test'}, {img: './images/help.svg', name: 'Help'}],
            float: 'left',
            click: function (tbar, d, n) {
                if (n == 'Test') {
                    const val = that.codeEditor.codeEditor.getValue();
                    closeNodeWin();
                    nodeRun(val);
                } else {
                    showHelpFile('模板/AfterShell.md', '生成后脚本说明', d);
                }
            }
        };
        this.callParent(arguments);
    }
});
