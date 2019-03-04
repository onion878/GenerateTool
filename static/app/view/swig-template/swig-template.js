Ext.define('OnionSpace.view.swig-template.swig-template', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.swig-template',
    viewModel: true,
    layout: 'fit',
    fileName: null,
    codeEditor: null,
    listeners: {
        render: function (c) {
            const that = this;
            that.codeEditor = Ext.create({
                language: 'javascript',
                value: geFileData.getSwig(that.pId),
                xtype: 'minicode',
                minimap: true
            });
            that.codeEditor.changeValue = function () {
                const val = that.codeEditor.codeEditor.getValue();
                geFileData.setSwig(that.pId, val);
            };
            that.add(that.codeEditor);
        }
    },
    initComponent: function () {
        const that = this;
        this.tbar = {
            xtype: 'statusbar',
            pId: this.pId,
            list: [{img: './images/use.svg', name: '应用'}],
            float: 'left',
            click: function (tbar, d) {
                const val = that.codeEditor.codeEditor.getValue();
                try {
                    eval(val);
                } catch (e) {
                    console.log(e);
                }
            }
        };
        this.callParent(arguments);
    }
})
;
