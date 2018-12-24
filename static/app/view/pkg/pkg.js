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
                text: '操作',
                align: 'center',
                items: [{
                    icon: 'images/coins_add.png',
                    tooltip: '安装最新版',
                    handler: function(view, recIndex, cellIndex, item, e, {data}) {
                        showToast(`安装成功后会重启软件!`);
                        const el = this.up('pkg').getEl();
                        el.mask('安装中...');
                        jsCode.downloadPkg(pId, data.name).then( fileName => {
                            el.unmask();
                            showToast(`${fileName},安装成功!`);
                            const remote = require('electron').remote;
                            remote.app.relaunch();
                            remote.app.exit(0);
                        }).catch(e => {
                            el.unmask();
                            showError(`安装失败-> ${e}`);
                        });
                    }
                },{
                    icon: 'images/cog_add.png',
                    tooltip: '安装其它版本',
                    handler: function(view, recIndex, cellIndex, item, e, {data}) {
                        const el = this.up('pkg').getEl();
                        showPrompt('输入版本号', '', function (text) {
                            el.mask('安装中...');
                            jsCode.downloadPkg(pId, data.name, text).then( fileName => {
                                el.unmask();
                                showToast(`${fileName},安装成功!`);
                            }).catch(e => {
                                el.unmask();
                                showError(`安装失败-> ${e}`);
                            });
                        }, this);
                    }
                }, {
                    icon: 'images/find.png',
                    tooltip: '详情',
                    handler: function(view, recIndex, cellIndex, item, e, record) {
                        require("open")(record.data.links.npm);
                    }
                }]
            }
        ];
        this.callParent(arguments);
    }
});