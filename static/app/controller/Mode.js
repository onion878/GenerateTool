
Ext.define('MyAppNamespace.controller.Mode', {
    extend: 'Ext.app.Controller',
    views: ['mode.mode'],
    init: function () {
        this.control({
            'viewport > panel': {
                render: this.onPanelRendered
            },
            'toolbar button[action=add]': {
                click: this.add
            },
            'toolbar button[action=save]': {
                click: this.save
            }
        });
    },
    onPanelRendered: function () {
        //console.debug('userpanel被渲染了');
    },
    add: function (btn) {
        const that = this;
        Ext.create('Ext.window.Window', {
            title: '添加变量',
            height: 180,
            width: 400,
            layout: 'fit',
            animateTarget: btn,
            resizable: false,
            constrain: true,
            modal: true,
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
                        margin: '10',
                        labelWidth: 45,
                        name: 'name',
                        allowBlank: false,
                        fieldLabel: '变量名'
                    },
                    {
                        xtype: 'combobox',
                        fieldLabel: '名称',
                        margin: '10',
                        labelWidth: 45,
                        store: {
                            fields: ['id', 'text'],
                            data: [
                                {id: 'text', text: '文本框'}
                            ]
                        },
                        name: 'type',
                        queryMode: 'local',
                        displayField: 'text',
                        valueField: 'id',
                        allowBlank: false,
                        fieldLabel: '类型'
                    }
                ]
            },
            buttonAlign: 'center',
            buttons: [
                {
                    text: '确定', handler: function () {
                        const form = this.up('window').down('form').getForm();
                        if (form.isValid()) {
                            const {type, name} = form.getValues();
                            btn.up('panel').add(Ext.create(that.getComponent(type, name)));
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
    },
    save: function (btn) {
        showPrompt('模板名称', '', function (text) {
            eval(text);
        }, this);
    },
    getComponent(type, label) {
        if (type == 'text') {
            return {
                xtype: 'container',
                layout: 'hbox',
                margin: {
                    left: 10,
                    right: 10,
                    bottom: 10
                },
                items: [
                    {
                        xtype: 'textfield',
                        fieldLabel: label,
                        flex: 1,
                        bind: {
                            value: `{name.${label}}`
                        },
                        required: true
                    },
                    {
                        xtype: 'button',
                        icon: 'images/script_code.png',
                        tooltip: '从js脚本取值',
                        handler: function (btn) {
                            Ext.create('Ext.window.Window', {
                                title: '使用脚本',
                                height: 160,
                                width: 400,
                                layout: 'fit',
                                animateTarget: this,
                                resizable: true,
                                constrain: true,
                                modal: true,
                                items: {
                                    xtype: 'textareafield',
                                    margin: '10'
                                },
                                buttonAlign: 'center',
                                buttons: [
                                    {
                                        text: '确定', handler: function () {
                                            const d = eval(this.up('window').down('textareafield').getRawValue());
                                            btn.up('container').down('textfield').setValue(d);
                                            this.up('window').close();
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
                    },
                    {
                        xtype: 'button',
                        icon: 'images/cancel.png',
                        tooltip: '删除',
                        handler: function (btn) {
                            showConfirm('是否删除?', function () {
                                btn.up('container').destroy();
                            });
                        }
                    }
                ]
            };
        } else {
            return {
                xtype: 'container',
                layout: 'hbox',
                margin: {
                    left: 10,
                    right: 10,
                    bottom: 10
                },
                items: [
                    {
                        xtype: 'textfield',
                        fieldLabel: label,
                        flex: 1,
                        bind: {
                            value: `{name.${label}}`
                        },
                        required: true
                    },
                    {
                        xtype: 'button',
                        width: 45,
                        text: '删除',
                        handler: function (btn) {
                            showConfirm('是否删除?', function () {
                                btn.up('container').destroy();
                            }, btn);
                        }
                    }
                ]
            }
        }
    }
});