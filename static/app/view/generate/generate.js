Ext.define('MyAppNamespace.view.generate.generate', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.generate',
    viewModel: true,
    layout: 'fit',
    fileName: null,
    codeEditor: null,
    listeners: {
        render: function (c) {
            const that = this;
            that.fileName = that.title;
            const language = systemConfig.getCode(that.fileName);
            const val = geFileData.getOneData(that.pId, that.params.path);
            let content = '';
            if( val != undefined) {
                content = val.content;
            }
            if (language == undefined) {
                Ext.create('Ext.window.Window', {
                    title: that.fileName,
                    fixed: true,
                    width: 400,
                    layout: 'fit',
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
                                xtype: 'combobox',
                                fieldLabel: '语言',
                                margin: '10',
                                labelWidth: 45,
                                store: {
                                    fields: ['id', 'text'],
                                    data: languageType
                                },
                                name: 'language',
                                queryMode: 'local',
                                displayField: 'text',
                                valueField: 'id',
                                allowBlank: false
                            }]
                    },
                    buttonAlign: 'center',
                    buttons: [
                        {
                            text: '确定', handler: function () {
                                const form = this.up('window').down('form').getForm();
                                if (form.isValid()) {
                                    const {language} = form.getValues();
                                    systemConfig.setCode(that.fileName, language);
                                    that.codeEditor = Ext.create({
                                        language: language,
                                        value: content,
                                        xtype: 'minicode'
                                    });
                                    that.add(that.codeEditor);
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
            } else {
                that.codeEditor = Ext.create({
                    language: language,
                    value: content,
                    xtype: 'minicode'
                });
                that.add(that.codeEditor);
            }
        }
    },
    initComponent: function () {
        const pId = this.pId;
        this.tbar = {
            dock: 'top',
            layout: {
                pack: 'center'
            },
            items: [{
                xtype: 'segmentedbutton',
                items: [{
                    text: '编辑',
                    pressed: true,
                    action: 'edit'
                }, {
                    text: '预览',
                    action: 'preview'
                }]
            }, {
                xtype: 'button',
                text: '生成'
            }]
        };
        this.callParent(arguments);
    }
})
;