Ext.define('MyAppNamespace.controller.Unpkg', {
    extend: 'Ext.app.Controller',
    views: ['unpkg.unpkg'],
    init: function () {
        this.control({
            'unpkg': {
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
        const grid = dom.up('unpkg'), that = this;
        const sm = grid.getSelectionModel().getSelection();
        if (sm.length == 0) {
            showError('请选择至少一条数据!');
            return;
        }
        const names = [];
        sm.map(d => {
            names.push(d.data.name);
        });
        showConfirm(`是否删除包[${names.join(',')}]?`, function (text) {
            jsCode.deleteAllPkg(grid.pId, names).then(name => {
                grid.getStore().setData(packageConfig.getAll(grid.pId));
            });
            names.forEach(n => {
                that.runDeletePkg(grid.pId, n);
            });
        }, dom, Ext.MessageBox.ERROR);
    },
    installAll: function (dom) {
        const grid = dom.up('unpkg');
        showToast(`安装中...,安装成功后使用需要重新启动!`);
        const d = grid.getStore().getData();
        d.items.forEach(({data}) => {
            this.installPkg(grid.pId, data.name, data.version);
        });
    },
    installPkg(pId, name, version) {
        if (version != undefined) {
            name = name + '@' + version;
        }
        if (Ext.getCmp('terminal').hidden) {
            document.getElementById('terminal-btn').click();
            const folder = jsCode.getFolder(pId);
            command.cdTargetFolder(folder);
            command.write('npm install ' + name);
        } else {
            command.write('npm install ' + name);
        }
    },
    runDeletePkg(pId, name) {
        if (Ext.getCmp('terminal').hidden) {
            document.getElementById('terminal-btn').click();
            const folder = jsCode.getFolder(pId);
            command.cdTargetFolder(folder);
            command.write('npm uninstall ' + name);
        } else {
            command.write('npm uninstall ' + name);
        }
    },
    onPanelRendered: function () {

    }
});