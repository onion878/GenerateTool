Ext.define('MyAppNamespace.view.editor.editor', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.editor',
    viewModel: true,
    layout: 'border',
    listeners: {
        render: function (c) {

        }
    },
    initComponent: function () {
        const pId = this.pId;
        this.items = [{
            region: 'west',
            split: true,
            width: 220,
            minWidth: 160,
            maxWidth: 400,
            margins: '0 0 0 0',
            xtype: 'treepanel',
            useArrows: true,
            lines: false,
            viewConfig: {
                plugins: [{
                    ptype: 'treeviewdragdrop',
                    appendOnly: true
                }],
                listeners: {
                    drop: function (node, data, overModel, dropPosition) {
                        const fileName = data.records[0].data.text;
                        const oldFolder = data.records[0].data.parentFolder;
                        const newFolder = data.records[0].parentNode.data.parentFolder;
                        jsCode.moveFile(pId, oldFolder, newFolder, fileName);
                        data.records[0].set('parentFolder', newFolder + '/' + fileName);
                    }
                }
            },
            rootVisible: true,
            store: Ext.create('Ext.data.TreeStore', {
                root: {
                    expanded: true,
                    text: 'root',
                    parentFolder: '',
                    children: jsCode.getFileAndFolder(this.pId)
                }
            }),
            listeners: {
                afteritemexpand: function (node, index, item, eOpts) {
                    while (node.firstChild) {
                        node.removeChild(node.firstChild);
                    }
                    const child = jsCode.getFileAndFolder(this.up('editor').pId, node.data.parentFolder);
                    node.appendChild(child);
                },
                itemclick: function (node, record) {
                    if (record.data.type == 'file') {
                        const {file, content} = jsCode.readFile(pId, record.data.parentFolder);
                        const tPanel = this.up('editor').down('tabpanel');
                        const id = record.data.id;
                        const nowItem = Ext.getCmp(id);
                        if (nowItem) {
                            tPanel.setActiveTab(nowItem);
                        } else {
                            const jTab = tPanel.add({
                                id: id,
                                pId: pId,
                                title: record.data.parentFolder,
                                filePath: file,
                                fileContent: content,
                                closable: true,
                                xtype: 'code'
                            });
                            tPanel.setActiveTab(jTab);
                        }
                    }
                },
                itemcontextmenu: function (node, record, item, index, event, eOpts) {
                    const that = this;
                    if (record.id == 'root') {
                        new Ext.menu.Menu({
                            minWidth: 60,
                            items: [
                                {
                                    text: '新建文件',
                                    icon: 'images/add.png',
                                    handler: function () {
                                        showPrompt('文件名', '', function (text) {
                                            const child = jsCode.createFile(that.up('editor').pId, text);
                                            const root = that.getRootNode();
                                            root.appendChild(child);
                                        });
                                    }
                                },
                                {
                                    text: '新建文件夹',
                                    icon: 'images/folder_add.png',
                                    handler: function () {
                                        showPrompt('文件夹', '', function (text) {
                                            const child = jsCode.createFolder(that.up('editor').pId, text);
                                            const root = that.getRootNode();
                                            root.appendChild(child);
                                        });
                                    }
                                },
                                {
                                    text: '安装包',
                                    icon: 'images/npm.jpg',
                                    handler: function () {
                                        const nowItem = Ext.getCmp('pkg-main');
                                        const tPanel = that.up('editor').down('tabpanel');
                                        if (nowItem) {
                                            tPanel.setActiveTab(nowItem);
                                        } else {
                                            const jTab = tPanel.add({
                                                id: 'pkg-main',
                                                pId: pId,
                                                title: '安装包',
                                                closable: true,
                                                xtype: 'pkg'
                                            });
                                            tPanel.setActiveTab(jTab);
                                        }
                                    }
                                },
                                {
                                    text: '管理包',
                                    icon: 'images/npm.jpg',
                                    handler: function () {
                                        const nowItem = Ext.getCmp('unpkg-main');
                                        const tPanel = that.up('editor').down('tabpanel');
                                        if (nowItem) {
                                            tPanel.setActiveTab(nowItem);
                                        } else {
                                            const jTab = tPanel.add({
                                                id: 'unpkg-main',
                                                pId: pId,
                                                title: '管理包',
                                                closable: true,
                                                xtype: 'unpkg'
                                            });
                                            tPanel.setActiveTab(jTab);
                                        }
                                    }
                                }
                            ]
                        }).showAt(event.getPoint());
                        return;
                    }
                    new Ext.menu.Menu({
                        minWidth: 60,
                        items: [
                            {
                                text: '新建文件',
                                icon: 'images/add.png',
                                handler: function () {
                                    showPrompt('文件名', '', function (text) {
                                        if (record.data.type == 'folder') {
                                            const child = jsCode.createFile(pId, text, record.data.parentFolder);
                                            record.appendChild(child)
                                        } else {
                                            const r = record.parentNode;
                                            const child = jsCode.createFile(pId, text, r.data.parentFolder);
                                            r.appendChild(child);
                                        }
                                    });
                                }
                            },
                            {
                                text: '新建文件夹',
                                icon: 'images/folder_add.png',
                                handler: function () {
                                    showPrompt('文件夹', '', function (text) {
                                        if (record.data.type == 'folder') {
                                            const child = jsCode.createFolder(pId, text, record.data.parentFolder);
                                            record.appendChild(child)
                                        } else {
                                            const r = record.parentNode;
                                            const child = jsCode.createFolder(pId, text, r.data.parentFolder);
                                            r.appendChild(child);
                                        }
                                    });
                                }
                            },
                            {
                                text: '重命名',
                                icon: 'images/arrow_refresh_small.png',
                                handler: function () {
                                    Ext.MessageBox.show({
                                        title: '名称',
                                        width: 300,
                                        prompt: true,
                                        value:  record.data.text,
                                        buttons: Ext.MessageBox.OKCANCEL,
                                        scope: this,
                                        fn:  function (btn, text) {
                                            if (btn === 'ok'){
                                                jsCode.reName(pId, record.data.text, text, record.parentNode.data.parentFolder);
                                                record.set('text', text);
                                                let parentFolder = record.parentNode.data.parentFolder;
                                                if (parentFolder == undefined) parentFolder = '';
                                                record.set('parentFolder', parentFolder + '/' + text);
                                                if (record.data.type == 'folder') {
                                                    that.collapseNode(record);
                                                    that.expandNode(record);
                                                }
                                            }
                                        }
                                    }).focus();
                                }
                            },
                            {
                                text: '删除',
                                icon: 'images/cross.png',
                                handler: function () {
                                    showConfirm(`是否删除[${record.data.text}]?`, function (text) {
                                        if (record.data.type == 'folder') {
                                            jsCode.unLinkFolder(pId, record.data.parentFolder);
                                        } else {
                                            jsCode.unLinkFile(pId, record.data.parentFolder);
                                        }
                                        record.parentNode.removeChild(record);
                                    });
                                }
                            }
                        ]
                    }).showAt(event.getPoint());
                }
            }
        }, {
            region: 'center',
            xtype: 'tabpanel',
            fullscreen: true,
            plugins: new Ext.ux.TabCloseMenu(),
            fullscreen: true
        }];
        this.callParent(arguments);
    }
});