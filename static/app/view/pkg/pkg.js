Ext.define('MyAppNamespace.view.pkg.pkg', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.pkg',
    viewModel: true,
    codeEditor: null,
    store: 'Pkg',
    plugins: [{
        ptype: 'rowexpander',
        rowBodyTpl: ['<p><b>描述:</b> {description}</p>']
    }],
    tbar: [{
        xtype: 'textfield',
        width: '100%',
        emptyText: '名称',
        action: 'search'
    }],
    initComponent: function () {
        const pId = this.pId;
        this.columns = [
            {text: '名称', align: 'center', dataIndex: 'name', flex: 1},
            {text: '最新版本', align: 'center', dataIndex: 'version', flex: 1},
            {
                text: '更新日期', align: 'center', dataIndex: 'date', flex: 1, renderer: function (v) {
                    return v.substring(0, 10);
                }
            },
            {
                xtype: 'actioncolumn',
                width: 60,
                sortable: false,
                align: 'center',
                items: [{
                    icon: 'images/coins_add.png',
                    tooltip: '安装最新版',
                    handler: function(view, recIndex, cellIndex, item, e, {data}) {
                        const el = this.up('pkg').getEl();
                        el.mask('安装中...');
                        Ext.Ajax.request({
                            url: `https://registry.npmjs.org/${data.name}/latest`,
                            success: function(response, opts) {
                                const donwloadUrl = Ext.decode(response.responseText).dist.tarball;
                                jsCode.downloadPkg(pId, data.name, donwloadUrl).then( fileName => {
                                    el.unmask();
                                    showToast(`${fileName},安装成功!`);
                                }).catch(e => {
                                    el.unmask();
                                    showError(`安装失败-> ${e}`);
                                });
                            },
                            failure: function(response, opts) {
                                el.unmask();
                                console.log('server-side failure with status code ' + response.status);
                            }
                        });
                    }
                },{
                    icon: 'images/cog_add.png',
                    tooltip: '安装其它版本',
                    handler: function(grid, rowIndex, colIndex) {
                        Ext.create('Ext.window.Window', {
                            title: '选择模板',
                            height: 120,
                            width: 400,
                            layout: 'fit',
                            resizable: false,
                            constrain: true,
                            modal: true,
                            items: {
                                xtype: 'combobox',
                                fieldLabel: '名称',
                                margin: '10',
                                labelWidth: 45,
                                store: {
                                    fields: ['id', 'text'],
                                    data: parentData.getAll()
                                },
                                queryMode: 'local',
                                displayField: 'text',
                                valueField: 'id'
                            },
                            buttonAlign: 'center',
                            buttons: [
                                {
                                    text: '确定', handler: function () {
                                        const combo = this.up('window').down('combobox');
                                        const row = combo.getSelectedRecord();
                                        if (row !== null) {
                                            pId = row.id;
                                            moduleId = pId;
                                            history.setMode(pId);
                                        }
                                        this.up('window').close();
                                        store.setRoot({
                                            expanded: true,
                                            text: '人员管理',
                                            children: data.getData(pId)
                                        });
                                        Ext.getCmp('panel-model').setTitle(row.data.text);
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
                }, {
                    icon: 'images/find.png',
                    tooltip: '详情',
                    handler: function(view, recIndex, cellIndex, item, e, record) {
                        window.open(record.data.links.npm);
                    }
                }]
            }
        ];
        this.callParent(arguments);
    }
});