Ext.define('OnionSpace.view.setting.setting', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.setting',
    viewModel: true,
    layout: 'fit',
    codeEditor: null,
    listeners: {
        render: function (c) {
        }
    },
    items: [{
        xtype: 'fieldset',
        title: '基本设置',
        checkboxToggle: true,
        defaultType: 'checkbox', // each item will be a checkbox
        layout: 'anchor',
        defaults: {
            anchor: '100%',
            hideEmptyLabel: false
        },
        items: [{
            xtype: 'filefield',
            name: 'terminal',
            fieldLabel: '终端',
            listeners: {
                render: function (dom) {
                    dom.setRawValue(systemConfig.getConfig('terminal'));
                },
                change: function (dom, val) {
                    systemConfig.setConfig('terminal', val);
                }
            }
        }, {
            xtype: 'filefield',
            name: 'editor',
            fieldLabel: '编辑器',
            listeners: {
                render: function (dom) {
                    dom.setRawValue(systemConfig.getConfig('editor'));
                },
                change: function (dom, val) {
                    systemConfig.setConfig('editor', val);
                }
            }
        }, {
            xtype: 'slider',
            name: 'editor',
            fieldLabel: '界面缩放',
            increment: 10,
            minValue: 0,
            maxValue: 200,
            tipText: function (thumb) {
                return Ext.String.format('<b>{0}% 缩放</b>', thumb.value);
            },
            value: systemConfig.getZoom() * 100,
            listeners: {
                dragend: function (dom) {
                    const v = dom.getValue();
                    systemConfig.setZoom(v / 100);
                    webFrame.setZoomFactor(v / 100);
                }
            }
        }]
    }],
    initComponent: function () {
        const pId = this.pId, that = this;
        this.callParent(arguments);
    }
});
