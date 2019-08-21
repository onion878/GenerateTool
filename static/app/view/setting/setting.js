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
        items: [
            {
                xtype: 'filefield',
                name: 'terminal',
                fieldLabel: '终端',
                listeners: {
                    render: function (dom) {
                        dom.setRawValue(execute('systemConfig', 'getConfig', ['terminal']));
                    },
                    change: function (dom, val) {
                        execute('systemConfig', 'setConfig', ['terminal', val])
                    }
                }
            },
            {
                xtype: 'filefield',
                name: 'editor',
                fieldLabel: '编辑器',
                listeners: {
                    render: function (dom) {
                        dom.setRawValue(execute('systemConfig', 'getConfig', ['editor']));
                    },
                    change: function (dom, val) {
                        execute('systemConfig', 'setConfig', ['editor', val]);
                    }
                }
            },
            {
                xtype: 'slider',
                name: 'editor',
                fieldLabel: '界面缩放',
                id: 'setting-zoom',
                increment: 10,
                minValue: 0,
                maxValue: 200,
                tipText: function (thumb) {
                    return Ext.String.format('<b>{0}% 缩放</b>', thumb.value);
                },
                listeners: {
                    render: function (dom) {
                        Ext.getCmp('setting-zoom').setValue(execute('systemConfig', 'getZoom') * 100);
                    },
                    dragend: function (dom) {
                        const v = dom.getValue();
                        execute('systemConfig', 'setZoom', [v / 100]);
                        webFrame.setZoomFactor(v / 100);
                    }
                }
            },
            {
                xtype: 'radiogroup',
                fieldLabel: '主题',
                layout: {
                    autoFlex: false
                },
                defaults: {
                    margin: '0 15 0 0'
                },
                items: [{
                    boxLabel: 'neptune',
                    inputValue: 'neptune'
                }, {
                    boxLabel: 'aria',
                    inputValue: 'aria'
                }],
                listeners: {
                    render: function (dom) {
                        let index = 0;
                        const t = execute('systemConfig', 'getTheme');
                        if (t == 'aria') {
                            index = 1;
                        }
                        dom.items.items[index].setValue(true);
                    },
                    change: function (dom, val) {
                        let t = '';
                        for (let v in val) {
                            t = val[v];
                        }
                        if (t != execute('systemConfig', 'getTheme')) {
                            execute('systemConfig', 'setTheme', [t]);
                            showConfirm(`是否重新启动?`, function (text) {
                                const {app} = require('electron').remote;
                                app.relaunch();
                                app.exit(0);
                            }, dom, Ext.MessageBox.ERROR);
                        }
                    }
                }
            },
            {
                xtype: 'textfield',
                fieldLabel: '服务端地址',
                emptyText: 'http://localhost:8000',
                listeners: {
                    render: function (dom) {
                        dom.setRawValue(execute('userConfig', 'getUrl'));
                    },
                    change: function (dom, val) {
                        execute('userConfig', 'setUrl', [val]);
                    }
                }
            },
            {
                xtype: 'filefield',
                fieldLabel: '背景图',
                listeners: {
                    render: function (dom) {
                        dom.setRawValue(execute('userConfig', 'getBg'));
                    },
                    change: function (dom, val) {
                        execute('userConfig', 'setBg', [val]);
                        document.body.style.backgroundImage = `url('${val.replace(/\\/g, '/')}')`;
                    }
                }
            },
            {
                xtype: 'slider',
                fieldLabel: '透明度',
                increment: 1,
                id: 'setting-opacity',
                minValue: 20,
                maxValue: 100,
                tipText: function (thumb) {
                    return Ext.String.format('<b>{0}% 不透明</b>', thumb.value);
                },
                listeners: {
                    render: function (dom) {
                        Ext.getCmp('setting-opacity').setValue(execute('userConfig', 'getOpacity') * 100);
                    },
                    dragend: function (dom) {
                        const v = dom.getValue();
                        execute('userConfig', 'setOpacity', [v / 100]);
                        document.body.style.opacity = v / 100;
                    }
                }
            }
        ]
    }],
    initComponent: function () {
        const pId = this.pId, that = this;
        this.callParent(arguments);
    }
});
