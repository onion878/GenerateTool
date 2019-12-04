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
                value: execute('geFileData', 'getSwig', [that.pId]),
                xtype: 'minicode',
                minimap: true
            });
            that.codeEditor.changeValue = function () {
                const val = that.codeEditor.codeEditor.getValue();
                execute('geFileData', 'setSwig', [that.pId, val]);
            };
            that.add(that.codeEditor);
        }
    },
    initComponent: function () {
        const that = this;
        this.tbar = {
            xtype: 'statusbar',
            pId: this.pId,
            list: [{img: './images/use.svg', name: '应用'}, {img: './images/help.svg', name: 'Help'}],
            float: 'left',
            click: function (tbar, d, n) {
                if (n == '应用') {
                    const val = that.codeEditor.codeEditor.getValue();
                    try {
                        eval(val);
                        if(runWin != null) {
                            nodeRun(val);
                        }
                        showToast('[success] swig模板应用成功!');
                    } catch (e) {
                        console.log(e);
                        showError(e);
                    }
                } else {
                    showHelpFile('模板/SwigTemplate.md', 'swig脚本说明', d);
                }
            }
        };
        this.callParent(arguments);
    }
})
;
