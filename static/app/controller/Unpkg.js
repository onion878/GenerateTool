Ext.define('MyAppNamespace.controller.Unpkg', {
    extend: 'Ext.app.Controller',
    views: ['unpkg.unpkg'],
    init: function () {
        this.control({
            'viewport > panel': {
                render: this.onPanelRendered
            },
            'toolbar button[action=refresh]': {
                click: this.refresh
            },
            'toolbar button[action=deletePkg]': {
                click: this.deletePkg
            },
            'toolbar button[action=installAll]': {
                click: this.installAll
            }
        });
    },
    refresh: function (dom) {
        const grid = dom.up('unpkg');
        grid.getStore().setData(packageConfig.getAll(grid.pId));
    },
    deletePkg: function (dom) {
        const grid = dom.up('unpkg');
        var sm = grid.getSelectionModel().getSelection();
        if (sm.length == 0) {
            showError('请选择至少一条数据!');
            return;
        }
        const names = [];
        sm.map(d => {
            names.push(d.data.name);
        });
        showConfirm(`是否删除包[${names.join(',')}]?`, function (text) {
            const el = grid.getEl();
            el.mask('删除中...');
            for (let i = 0; i < names.length; i++) {
                jsCode.unInstallPkg(grid.pId, names[i]).then(name => {
                    if (i == names.length - 1) {
                        el.unmask();
                        showToast(`${names.join(',')},删除成功!`);
                        grid.getStore().setData(packageConfig.getAll(grid.pId));
                    }
                }).catch(e => {
                    el.unmask();
                    showError(`删除失败-> ${e}`);
                });
            }
        });
    },
    installAll: function(dom) {
        const grid = dom.up('unpkg');
        showToast('后台安装中, 请稍等...');
        const d = grid.getStore().getData();
        d.items.forEach(({data})=> {
            jsCode.downloadPkg(grid.pId, data.name, data.version).then( fileName => {
                showToast(`${fileName},安装成功!`);
            }).catch(e => {
                showError(`安装失败-> ${e}`);
            });
        });
    },
    onPanelRendered: function () {

    }
});