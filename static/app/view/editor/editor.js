Ext.define('MyAppNamespace.view.editor.editor', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.editor',
    viewModel: true,
    layout: 'border',
    listeners: {
        render: function (c) {
            const dom = this.getEl().down('.code-content');
            const len = dom.query('div').length;
            if (len == 0) {
                dom.append(Ext.get('vscode-container'));
            }
            if (jsFile != null)
                this.up('window').setTitle('正在编辑:' + jsFile.substring(jsFile.lastIndexOf('/')+1));
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
            closable: false,
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
                        jsFile = file;
                        vsEditor.setValue(content);
                        this.up('window').setTitle('正在编辑:' + record.data.text);
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
                                    showPrompt('名称', '', function (text) {
                                        jsCode.reName(pId, record.data.text, text, record.parentNode.data.parentFolder);
                                        record.set('text', text);
                                        let parentFolder = record.parentNode.data.parentFolder;
                                        if (parentFolder == undefined) parentFolder = '';
                                        record.set('parentFolder', parentFolder + '/' + text);
                                        if (record.data.type == 'folder') {
                                            that.collapseNode(record);
                                            that.expandNode(record);
                                        }
                                    });
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
            xtype: 'panel',
            html: `<div class="code-content"></div>`,
            fullscreen: true
        }];
        this.callParent(arguments);
    }
});