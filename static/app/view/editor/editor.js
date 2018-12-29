Ext.define('MyAppNamespace.view.editor.editor', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.editor',
    viewModel: true,
    layout: 'border',
    listeners: {
        render: function (c) {
            const tPanel = this.down('tabpanel');
            history.getCode().forEach(c => {
                tPanel.add(c);
            });
            tPanel.setActiveTab(history.getShowCodeTab());
            jsCode.initFile(this.pId);
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
                        if (data.records[0].data.parentId == 'root' && (fileName == 'data.js' || fileName == 'package.json')) return;
                        const oldFolder = data.records[0].data.parentFolder;
                        const newFolder = data.records[0].parentNode.data.parentFolder;
                        jsCode.moveFile(pId, oldFolder, newFolder, fileName);
                        data.records[0].set('parentFolder', newFolder + '/' + fileName);
                    }
                },
                getRowClass: function (record, rowIndex, rowParams, store) {
                    if (record.data.parentId == 'root' && (record.data.text == 'data.js' || record.data.text == 'package.json')) {
                        return 'color-display';
                    } else {
                        return '';
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
                        if (record.data.parentId == 'root' && (record.data.text == 'data.js' || record.data.text == 'package.json')) return;
                        const {file, content} = jsCode.readFile(pId, record.data.parentFolder);
                        const tPanel = this.up('editor').down('tabpanel');
                        const id = record.data.parentFolder;
                        const nowItem = Ext.getCmp(id);
                        if (nowItem) {
                            tPanel.setActiveTab(nowItem);
                        } else {
                            const data = {
                                id: id,
                                pId: pId,
                                title: record.data.parentFolder,
                                filePath: file,
                                fileContent: content,
                                closable: true,
                                icon: './images/script_code.png',
                                xtype: 'code'
                            };
                            const jTab = tPanel.add(data);
                            history.setCode(data);
                            tPanel.setActiveTab(jTab);
                        }
                    }
                },
                itemcontextmenu: function (node, record, item, index, event, eOpts) {
                    const that = this;
                    if (record.data.parentId == 'root' && (record.data.text == 'data.js' || record.data.text == 'package.json')) return;
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
                                            const data = {
                                                id: 'pkg-main',
                                                pId: pId,
                                                title: '安装包',
                                                closable: true,
                                                icon: './images/npm.jpg',
                                                xtype: 'pkg'
                                            };
                                            const jTab = tPanel.add(data);
                                            history.setCode(data);
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
                                            const data = {
                                                id: 'unpkg-main',
                                                pId: pId,
                                                title: '管理包',
                                                closable: true,
                                                icon: './images/npm.jpg',
                                                xtype: 'unpkg'
                                            };
                                            const jTab = tPanel.add(data);
                                            tPanel.setActiveTab(jTab);
                                            history.setCode(data);
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
                                        value: record.data.text,
                                        buttons: Ext.MessageBox.OKCANCEL,
                                        scope: this,
                                        fn: function (btn, text) {
                                            if (btn === 'ok') {
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
            listeners: {
                tabchange: function (tabPanel, tab) {
                    history.setShowCodeTab(tab.id);
                },
                remove: function (tabPanel, tab) {
                    history.removeCodeTab(tab.config.id);
                }
            }
        }, {
            region: 'south',
            split: true,
            height: 100,
            minSize: 100,
            maxSize: 200,
            id: 'terminal',
            collapsible: false,
            collapsed: false,
            hidden: true,
            html: `<div style="background: white;overflow: hidden;" id="term"></div>`,
            margins: '0 0 0 0',
            listeners: {
                resize: function (el) {
                    document.getElementById('term').style.height = document.getElementById('terminal-body').style.height;
                    command.fitTerm();
                }
            },
            tbar: {
                xtype: 'statusbar',
                pId: pId,
                float: 'right',
                list: [
                    {img: './images/stop.png', name: 'Stop'},
                    {img: './images/delete.png', name: 'Clear'}
                ],
                click: function (s, d, n) {
                    if (n == 'Clear') {
                        command.clearTerm();
                    } else {
                        command.cancelPty();
                    }
                }
            }
        }];

        this.bbar = {
            xtype: 'statusbar',
            pId: pId,
            list: [{id: 'terminal-btn', img: './images/terminal.png', name: 'Terminal'}],
            float: 'left',
            status: false,
            flagShow: false,
            flagInit: false,
            click: function (that, dom) {
                if (!that.status && !that.flagInit) {
                    that.status = true;
                    Ext.getCmp('terminal').show();
                    that.flagShow = true;
                    that.flagInit = true;
                    command.init(document.getElementById('term')).then((pty, xterm) => {
                        that.status = false;
                        const folder = jsCode.getFolder(that.pId);
                        command.cdTargetFolder(folder);
                    });
                } else {
                    if (that.flagShow) {
                        Ext.getCmp('terminal').hide();
                        that.flagShow = false;
                    } else {
                        Ext.getCmp('terminal').show();
                        that.flagShow = true;
                    }
                }
                if (that.flagShow) {
                    dom.className = "active";
                } else {
                    dom.className = "";
                }
            }
        };
        this.callParent(arguments);
    }
});