Ext.define('OnionSpace.view.before-shell.before-shell', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.before-shell',
    requires: [
        'OnionSpace.controller.BeforeShell'
    ],
    controller: 'BeforeShell',
    layout: 'fit',
    codeEditor: null,
    listeners: {
        render: function (c) {
            const that = this;
            that.codeEditor = Ext.create({
                language: 'javascript',
                value: geFileData.getBeforeShell(that.pId),
                xtype: 'minicode',
                minimap: true
            });
            that.codeEditor.changeValue = function () {
                const val = that.codeEditor.codeEditor.getValue();
                geFileData.setBeforeShell(that.pId, val);
            };
            that.add(that.codeEditor);
        }
    },
    initComponent: function () {
        const that = this;
        this.tbar = {
            xtype: 'statusbar',
            pId: this.pId,
            list: [{img: './images/test.svg', name: 'Test'}],
            float: 'left',
            click: function (tbar, d) {
                const val = that.codeEditor.codeEditor.getValue();
                closeNodeWin();
                nodeRun(val);
            }
        };
        this.callParent(arguments);
    }
});
