Ext.define('OnionSpace.controller.Templet', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.Templet',
    init: function () {
        this.control({
            'templet': {
                render: this.onPanelRendered
            },
            'toolbar button[action=refreshGrid]': {
                click: this.refreshGrid
            },
            'toolbar button[action=importModule]': {
                click: this.importModule
            },
            'toolbar button[action=copyModule]': {
                click: this.copyModule
            }
        });
    },
    refreshGrid: function (dom) {
        const grid = dom.up('templet');
        grid.getStore().setData(execute('parentData', 'getAll'));
    },
    importModule: function (dom) {
        const remote = require('electron').remote;
        const dialog = remote.dialog;
        dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [{name: '模板压缩文件', extensions: ['zip']}]
        }, (file) => {
            if (file != undefined) {
                const el = dom.up('templet').getEl();
                el.mask('导入中...');
                jsCode.importModule(file[0]).then(msg => {
                    el.unmask();
                    showToast('[info] ' + msg);
                    dom.up('templet').getStore().setData(execute('parentData', 'getAll'));

                }).catch(e => {
                    console.error(e);
                    el.unmask();
                    showError(e);
                });
            }
        });
    },
    onPanelRendered: function () {

    },
    copyModule: function (dom) {
        Ext.create('Ext.window.Window', {
            title: '复制模板',
            width: 400,
            layout: 'fit',
            fixed: true,
            animateTarget: dom,
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
                        fieldLabel: '选择模板',
                        margin: '10',
                        labelWidth: 60,
                        store: {
                            fields: ['id', 'text'],
                            data: execute('parentData', 'getAll')
                        },
                        name: 'oldName',
                        queryMode: 'local',
                        displayField: 'text',
                        valueField: 'id',
                        allowBlank: false,
                        listeners: {
                            select: function (combo, record) {
                                const {text} = record.data;
                                this.up('form').getForm().setValues({name: text});
                            }
                        }
                    },
                    {
                        xtype: 'textfield',
                        margin: '10',
                        labelWidth: 60,
                        name: 'name',
                        allowBlank: false,
                        fieldLabel: '新名称'
                    }
                ]
            },
            buttonAlign: 'center',
            buttons: [{
                text: '确定',
                handler: function () {
                    const form = this.up('window').down('form').getForm();
                    if (form.isValid()) {
                        const el = Ext.getCmp('main-content');
                        el.mask('处理中...');
                        const {name, oldName} = form.getValues();
                        this.up('window').close();
                        const data = {id: oldName, text: name};
                        data.folder = require('../service/utils/help').getDataPath();
                        data.newId = utils.getUUID();
                        jsCode.exportModule(data).then(t => {
                            const file = data.folder + data.text + '.zip';
                            jsCode.importModule(file, data.text).then(() => {
                                jsCode.deleteFile(file);
                                el.unmask();
                                dom.up('templet').getStore().setData(execute('parentData', 'getAll'));
                                showToast('复制成功,你可以通过[选择模板]来选择');
                            }).catch(err => {
                                console.error(err);
                                showError(err);
                                el.unmask();
                            });
                        }).catch(err => {
                            console.error(err);
                            showError(err);
                            el.unmask();
                        });
                    }
                }
            }, {
                text: '取消',
                handler: function () {
                    this.up('window').close();
                }
            }
            ]
        }).show().focus();
    }
});
