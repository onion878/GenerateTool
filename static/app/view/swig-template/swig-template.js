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
                try {
                    eval(val);
                } catch (e) {
                    console.log(e);
                }
            };
            that.add(that.codeEditor);
        }
    },
    initComponent: function () {
        this.callParent(arguments);
    }
})
;
