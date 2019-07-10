Ext.define('OnionSpace.view.generate.generate', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.generate',
    requires: [
        'OnionSpace.controller.Generate'
    ],
    controller: 'Generate',
    viewModel: true,
    layout: 'fit',
    fileName: null,
    codeEditor: null,
    listeners: {
        render: function (c) {
            const that = this;
            that.fileName = that.title;
            let language = getFileLanguage(that.fileName);
            if (language == undefined) {
                language = systemConfig.getCode(that.fileName);
            }
            let val = geFileData.getOneData(that.params.fileId);
            let content = '';
            if (val != undefined) {
                content = val.content;
            }
            if (language == undefined) {
                language = 'html';
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
                                    that.codeEditor.updateLanguage(content, language);
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
            that.codeEditor = Ext.create({
                language: language,
                value: content,
                minimap: true,
                xtype: 'minicode'
            });
            that.add(that.codeEditor);
        }
    },
    initComponent: function () {
        const {updateType} = this.params;
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
                    action: 'edit',
                    cls: updateType == 'update' ? 'color-blue' : ''
                }, {
                    text: '预览',
                    action: 'preview',
                    cls: updateType == 'update' ? 'color-blue' : ''
                }]
            }]
        };
        this.callParent(arguments);
    }
})
;
