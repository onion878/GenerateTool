Ext.define('OnionSpace.view.setting.setting', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.setting',
    viewModel: true,
    codeEditor: null,
    bodyPadding: 10,
    listeners: {
        render: function (c) {
        }
    },
    scrollable: true,
    items: [
        {
            xtype: 'fieldset',
            title: '基本设置',
            checkboxToggle: true,
            defaultType: 'textfield',
            defaults: {
                labelAlign: 'top',
                anchor: '100%'
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
                    increment: 1,
                    minValue: 0,
                    maxValue: 200,
                    tipText: function (thumb) {
                        return Ext.String.format('<b>{0}% 缩放</b>', thumb.value);
                    },
                    listeners: {
                        render: function (dom) {
                            dom.setValue(execute('systemConfig', 'getZoom') * 100);
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
                    cls: 'x-check-group-alt',
                    defaults: {
                        margin: '0 15 0 0',
                    },
                    items: [{
                        boxLabel: 'light',
                        inputValue: 'light'
                    }, {
                        boxLabel: 'dark',
                        inputValue: 'dark'
                    }],
                    listeners: {
                        render: function (dom) {
                            let index = 0;
                            const t = execute('systemConfig', 'getTheme');
                            if (t == 'dark') {
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
                                Ext.theme.Material.setDarkMode(t == 'dark' ? true : false);
                                monaco.editor.setTheme(t == 'dark' ? 'darkTheme' : 'lightTheme');
                                execute('systemConfig', 'setTheme', [t]);
                            }
                        }
                    }
                },
                {
                    xtype: 'colorfield',
                    fieldLabel: '颜色',
                    defaults: {
                        margin: '0 15 0 0',
                    },
                    listeners: {
                        render: function (dom) {
                            dom.setValue(execute('systemConfig', 'getConfig', ['color']) ? execute('systemConfig', 'getConfig', ['color']) : '2196f3');
                        },
                        change: function (dom, val) {
                            if (val == 'ff0000') return;
                            dom.up('setting').updateMaterialTheme('#' + val);
                            execute('systemConfig', 'setConfig', ['color', val]);
                        }
                    }
                },
                {
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
                    xtype: 'container',
                    flex: 1,
                    layout: 'hbox',
                    items: [
                        {
                            xtype: 'textfield',
                            emptyText: '背景图',
                            flex: 1,
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
                            xtype: 'button',
                            text: '选择文件',
                            handler: function (btn) {
                                const remote = require('electron').remote;
                                const dialog = remote.dialog;
                                dialog.showOpenDialog(remote.getCurrentWindow(), {properties: ['openFile']}).then(({canceled, filePaths}) => {
                                    if (!canceled && filePaths != undefined && !utils.isEmpty(filePaths[0])) {
                                        const val = filePaths[0];
                                        btn.up('container').down('textfield').setRawValue(val);
                                        execute('userConfig', 'setBg', [val]);
                                        document.body.style.backgroundImage = `url('${val.replace(/\\/g, '/')}')`;
                                    }
                                });
                            }
                        }
                    ]
                },
                {
                    xtype: 'slider',
                    fieldLabel: '背景透明度',
                    increment: 1,
                    minValue: 20,
                    maxValue: 100,
                    tipText: function (thumb) {
                        return Ext.String.format('<b>{0}% 不透明</b>', thumb.value);
                    },
                    listeners: {
                        render: function (dom) {
                            dom.setValue(execute('userConfig', 'getOpacity') * 100);
                        },
                        dragend: function (dom) {
                            const v = dom.getValue();
                            execute('userConfig', 'setOpacity', [v / 100]);
                            document.body.style.opacity = v / 100;
                        }
                    }
                },
                {
                    xtype: 'slider',
                    fieldLabel: '窗体透明度',
                    increment: 1,
                    minValue: 20,
                    maxValue: 100,
                    tipText: function (thumb) {
                        return Ext.String.format('<b>{0}% 不透明</b>', thumb.value);
                    },
                    listeners: {
                        render: function (dom) {
                            dom.setValue(execute('systemConfig', 'getConfig', ['win-opacity']) * 100);
                        },
                        dragend: function (dom) {
                            const v = dom.getValue();
                            execute('systemConfig', 'setConfig', ['win-opacity', v / 100]);
                            const {remote} = require('electron');
                            remote.getCurrentWindow().setOpacity(v / 100);
                        }
                    }
                },
            ]
        },
        {
            xtype: 'fieldset',
            title: '语言设置',
            checkboxToggle: true,
            defaultType: 'textfield',
            defaults: {
                anchor: '100%'
            },
            items: []
        }
    ],
    initComponent: function () {
        const code = execute('systemConfig', 'getAllCode');
        this.items[1].items = [
            {
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    pack: 'center'
                },
                margin: {
                    right: 10,
                    bottom: 10
                },
                items: [
                    {
                        xtype: 'button',
                        tooltip: '添加数据模板',
                        text: '添加',
                        icon: 'images/add.svg',
                        handler: function (btn) {
                            Ext.create('Ext.window.Window', {
                                title: '添加语言设置',
                                fixed: true,
                                width: 400,
                                layout: 'fit',
                                resizable: false,
                                constrain: true,
                                modal: true,
                                animateTarget: btn,
                                items: {
                                    xtype: 'form',
                                    layout: {
                                        type: 'vbox',
                                        pack: 'start',
                                        align: 'stretch'
                                    },
                                    items: [
                                        {
                                            xtype: 'textfield',
                                            fieldLabel: '文件后缀名',
                                            margin: '10',
                                            labelWidth: 90,
                                            name: 'name',
                                            allowBlank: false
                                        },
                                        {
                                            xtype: 'combobox',
                                            fieldLabel: '语言',
                                            margin: '10',
                                            labelWidth: 90,
                                            store: {
                                                fields: ['id', 'text'],
                                                data: languageType
                                            },
                                            name: 'language',
                                            queryMode: 'local',
                                            displayField: 'text',
                                            valueField: 'id',
                                            allowBlank: false
                                        }
                                    ]
                                },
                                buttonAlign: 'center',
                                buttons: [
                                    {
                                        text: '确定', handler: function () {
                                            const form = this.up('window').down('form').getForm();
                                            if (form.isValid()) {
                                                const f = form.getValues();
                                                let name = f.name.trim(), language = f.language.trim();
                                                const codes = execute('systemConfig', 'getAllCode');
                                                if (codes[name]) {
                                                    Ext.MessageBox.show({
                                                        title: '错误提示',
                                                        msg: '已存在相同配置!',
                                                        buttons: Ext.MessageBox.OK,
                                                        icon: Ext.MessageBox.ERROR
                                                    });
                                                    return;
                                                }
                                                execute('systemConfig', 'updateCode', [name, language]);
                                                btn.up('container').up('fieldset').add({
                                                    xtype: 'container',
                                                    layout: 'hbox',
                                                    margin: {
                                                        right: 10,
                                                        bottom: 10
                                                    },
                                                    items: [
                                                        {
                                                            xtype: 'combobox',
                                                            flex: 1,
                                                            fieldLabel: name,
                                                            store: {
                                                                fields: ['id', 'text'],
                                                                data: languageType
                                                            },
                                                            name: name,
                                                            value: language,
                                                            queryMode: 'local',
                                                            displayField: 'text',
                                                            valueField: 'id',
                                                            listeners: {
                                                                change: function (dom, val) {
                                                                    execute('systemConfig', 'updateCode', [dom.name, val])
                                                                }
                                                            }
                                                        },
                                                        {
                                                            xtype: 'button',
                                                            icon: 'images/cancel.svg',
                                                            tooltip: '删除',
                                                            bId: name,
                                                            handler: function (btn) {
                                                                showConfirm('是否删除?', function () {
                                                                    execute('systemConfig', 'removeCode', [btn.bId]);
                                                                    btn.up('container').destroy();
                                                                }, btn, Ext.MessageBox.ERROR);
                                                            }
                                                        }
                                                    ]
                                                });
                                                this.up('window').close();
                                            }
                                        }
                                    },
                                    {
                                        text: '取消', handler: function () {
                                            this.up('window').close();
                                        }
                                    }
                                ]
                            }).show().focus();
                        }
                    }
                ]
            }
        ];
        for (let k in code) {
            this.items[1].items.push({
                xtype: 'container',
                layout: 'hbox',
                margin: {
                    right: 10,
                    bottom: 10
                },
                items: [
                    {
                        xtype: 'combobox',
                        flex: 1,
                        fieldLabel: k,
                        store: {
                            fields: ['id', 'text'],
                            data: languageType
                        },
                        name: k,
                        value: code[k],
                        queryMode: 'local',
                        displayField: 'text',
                        valueField: 'id',
                        listeners: {
                            change: function (dom, val) {
                                execute('systemConfig', 'updateCode', [dom.name, val])
                            }
                        }
                    },
                    {
                        xtype: 'button',
                        icon: 'images/cancel.svg',
                        tooltip: '删除',
                        bId: k,
                        handler: function (btn) {
                            showConfirm('是否删除?', function () {
                                execute('systemConfig', 'removeCode', [btn.bId]);
                                btn.up('container').destroy();
                            }, btn, Ext.MessageBox.ERROR);
                        }
                    }
                ]
            });
        }
        this.callParent(arguments);
    },
    updateMaterialTheme: function (base) {
        document.body.style = `${document.body.attributes['style'].value};--base-color:${base};`;
    }
});
