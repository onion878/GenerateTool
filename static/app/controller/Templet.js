Ext.define('MyAppNamespace.controller.Templet', {
    extend: 'Ext.app.Controller',
    views: ['templet.templet'],
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
            }
        });
    },
    refreshGrid: function (dom) {
        const grid = dom.up('templet');
        grid.getStore().setData(parentData.getAll());
    },
    importModule: function (dom) {
        const remote = require('electron').remote;
        const dialog = remote.dialog;
        dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [{name: '模板压缩文件', extensions: ['zip']}]
        }, (file) => {
            if(file != undefined) {
                const el = dom.up('templet').getEl();
                el.mask('导入中...');
                jsCode.importModule(file[0]).then( msg => {
                    el.unmask();
                    showToast('[info] ' + msg);
                    dom.up('templet').getStore().setData(parentData.getAll());

                }).catch(e => {
                    el.unmask();
                    showError(e);
                });
            }
        });
    },
    onPanelRendered: function () {

    }
});
