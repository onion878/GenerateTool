Ext.define('OnionSpace.view.editor.editor', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.editor',
    viewModel: true,
    layout: 'accordion',
    listeners: {
        render: function (c) {
            if (utils.isEmpty(this.pId)) {
                showToast('请先[选择模板]或[创建模板]!');
            } else {
                jsCode.createFolder(this.pId);
                jsCode.initFile(this.pId);
            }
        }
    },
    initComponent: function () {
        const pId = this.pId;
        const rootData = jsCode.getFileAndFolder(pId);
        rootData.forEach(r => {
            if (r.type == 'file') {
                r.icon = getFileIcon(r.text);
            } else {
                r.icon = './icons/folder-core.svg';
            }
        });
        this.items = {
            margins: '0 0 0 0',
            xtype: 'treepanel',
            title: 'JS脚本',
            useArrows: true,
            lines: false,
            rootVisible: false,
            hideCollapseTool: true,
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
            store: Ext.create('Ext.data.TreeStore', {
                root: {
                    expanded: true,
                    text: 'root',
                    parentFolder: '',
                    icon: './icons/folder-core-open.svg',
                    children: rootData
                }
            }),
            tools: [
                {
                    renderTpl: [
                        '<div id="{id}-toolEl" class="x-tool-tool-el" style="background: url(images/refresh.svg)" role="presentation"></div>'
                    ],
                    qtip: '刷新',
                    listeners: {
                        click: function () {
                            const that = this;
                            const rootData = jsCode.getFileAndFolder(pId);
                            rootData.forEach(r => {
                                if (r.type == 'file') {
                                    r.icon = getFileIcon(r.text);
                                } else {
                                    r.icon = './icons/folder-core.svg';
                                }
                            });
                            const store = Ext.create('Ext.data.TreeStore', {
                                root: {
                                    expanded: true,
                                    text: 'root',
                                    parentFolder: '',
                                    icon: './icons/folder-core-open.svg',
                                    children: rootData
                                }
                            })
                            that.up('treepanel').setStore(store);
                        }
                    }
                },
                {
                    renderTpl: [
                        '<div id="{id}-toolEl" class="x-tool-tool-el" style="background: url(images/add.svg)" role="presentation"></div>'
                    ],
                    qtip: '新建文件',
                    listeners: {
                        click: function () {
                            const that = this;
                            showPrompt('文件名', '', function (text) {
                                const child = jsCode.createFile(that.up('editor').pId, text);
                                child.icon = getFileIcon(text);
                                const root = that.up('treepanel').getRootNode();
                                root.appendChild(child);
                            }, that);
                        }
                    }
                },
                {
                    renderTpl: [
                        '<div id="{id}-toolEl" class="x-tool-tool-el" style="background: url(images/folder_add.svg)" role="presentation"></div>'
                    ],
                    qtip: '新建文件夹',
                    listeners: {
                        click: function () {
                            const that = this;
                            showPrompt('文件夹', '', function (text) {
                                const child = jsCode.createFolder(that.up('editor').pId, text);
                                child.icon = './icons/folder-core.svg';
                                const root = that.up('treepanel').getRootNode();
                                root.appendChild(child);
                            }, that);
                        }
                    }
                },
                {
                    renderTpl: [
                        '<div id="{id}-toolEl" class="x-tool-tool-el x-tool-img-more" role="presentation"></div>'
                    ],
                    qtip: '其它配置',
                    listeners: {
                        click: function (btn, e) {
                            new Ext.menu.Menu({
                                minWidth: 60,
                                items: [
                                    {
                                        text: '编辑器打开',
                                        icon: 'images/javascript.svg',
                                        handler: function () {
                                            showConfirm(`是否采用编辑器打开项目?`, function (text) {
                                                utils.openCodeFolder(execute('systemConfig', 'getConfig', ['editor']), jsCode.getFolder(pId));
                                            }, this, Ext.MessageBox.INFO);
                                        }
                                    },
                                    {
                                        text: '在文件夹中显示',
                                        icon: 'images/folder.svg',
                                        handler: function () {
                                            const {shell} = require('electron');
                                            shell.openPath(jsCode.getFolder(pId)).then();
                                        }
                                    },
                                    {
                                        text: '管理包',
                                        icon: 'images/npm.svg',
                                        handler: function () {
                                            const nowItem = Ext.getCmp('unpkg-main');
                                            const tPanel = Ext.getCmp('mainmenutab');
                                            if (nowItem) {
                                                tPanel.setActiveTab(nowItem);
                                            } else {
                                                tPanel.mask('加载中...');
                                                Ext.require(controllers['unpkg'], function () {
                                                    tPanel.unmask();
                                                    const data = {
                                                        id: 'unpkg-main',
                                                        pId: pId,
                                                        title: '管理包',
                                                        closable: true,
                                                        useType: 'editor',
                                                        icon: './images/npm.svg',
                                                        xtype: 'unpkg'
                                                    };
                                                    const jTab = tPanel.add(data);
                                                    tPanel.setActiveTab(jTab);
                                                    execute('history', 'setCode', [data]);
                                                });
                                            }
                                        }
                                    },
                                    {
                                        text: '安装包',
                                        icon: 'images/npm-install.svg',
                                        handler: function () {
                                            const nowItem = Ext.getCmp('pkg-main');
                                            const tPanel = Ext.getCmp('mainmenutab');
                                            if (nowItem) {
                                                tPanel.setActiveTab(nowItem);
                                            } else {
                                                tPanel.mask('加载中...');
                                                Ext.require(controllers['pkg'], function () {
                                                    tPanel.unmask();
                                                    const data = {
                                                        id: 'pkg-main',
                                                        pId: pId,
                                                        title: '安装包',
                                                        closable: true,
                                                        icon: './images/npm-install.svg',
                                                        useType: 'editor',
                                                        xtype: 'pkg'
                                                    };
                                                    const jTab = tPanel.add(data);
                                                    execute('history', 'setCode', [data]);
                                                    tPanel.setActiveTab(jTab);
                                                });
                                            }
                                        }
                                    }
                                ]
                            }).showAt(e.getPoint());
                        }
                    }
                }
            ],
            listeners: {
                beforeitemexpand: function (node, index, item, eOpts) {
                    node.data.icon = './icons/folder-core-open.svg';
                },
                beforeitemcollapse: function (node, index, item, eOpts) {
                    node.data.icon = './icons/folder-core.svg';
                },
                afteritemexpand: function (node, index, item, eOpts) {
                    node.removeAll();
                    const child = jsCode.getFileAndFolder(this.up('editor').pId, node.data.parentFolder);
                    child.forEach(r => {
                        if (r.type == 'file') {
                            r.icon = getFileIcon(r.text);
                        } else {
                            r.icon = './icons/folder-core.svg';
                        }
                    });
                    node.appendChild(child);
                },
                itemclick: function (node, record) {
                    if (record.data.type == 'file') {
                        if (record.data.text == 'data.js' || record.data.text == 'package.json') return;
                        const {file, content} = jsCode.readFile(pId, record.data.parentFolder);
                        const tPanel = Ext.getCmp('mainmenutab');
                        const id = record.data.parentFolder;
                        const nowItem = Ext.getCmp(id);
                        if (nowItem) {
                            tPanel.setActiveTab(nowItem);
                        } else {
                            tPanel.mask('加载中...');
                            Ext.require(controllers['code'], function () {
                                tPanel.unmask();
                                const data = {
                                    id: id,
                                    pId: pId,
                                    title: record.data.parentFolder,
                                    filePath: file,
                                    fileContent: content,
                                    closable: true,
                                    icon: getFileIcon(file),
                                    useType: 'editor',
                                    xtype: 'code'
                                };
                                const jTab = tPanel.add(data);
                                execute('history', 'setCode', [data]);
                                tPanel.setActiveTab(jTab);
                            });
                        }
                    }
                },
                itemcontextmenu: function (node, record, item, index, event, eOpts) {
                    const that = this;
                    new Ext.menu.Menu({
                        minWidth: 60,
                        items: [
                            {
                                text: '新建文件',
                                icon: 'images/add.svg',
                                handler: function () {
                                    showPrompt('文件名', '', function (text) {
                                        if (record.data.type == 'folder') {
                                            const child = jsCode.createFile(pId, text, record.data.parentFolder);
                                            child.icon = getFileIcon(text);
                                            record.appendChild(child)
                                        } else {
                                            const r = record.parentNode;
                                            const child = jsCode.createFile(pId, text, r.data.parentFolder);
                                            child.icon = getFileIcon(text);
                                            r.appendChild(child);
                                        }
                                    }, item);
                                }
                            },
                            {
                                text: '新建文件夹',
                                icon: 'images/folder_add.svg',
                                handler: function () {
                                    showPrompt('文件夹', '', function (text) {
                                        if (record.data.type == 'folder') {
                                            const child = jsCode.createFolder(pId, text, record.data.parentFolder);
                                            child.icon = './icons/folder-core.svg';
                                            record.appendChild(child)
                                        } else {
                                            const r = record.parentNode;
                                            const child = jsCode.createFolder(pId, text, r.data.parentFolder);
                                            child.icon = './icons/folder-core.svg';
                                            r.appendChild(child);
                                        }
                                    }, item);
                                }
                            },
                            {
                                text: '重命名',
                                icon: 'images/edit.svg',
                                handler: function () {
                                    Ext.MessageBox.show({
                                        title: '名称',
                                        width: 300,
                                        prompt: true,
                                        value: record.data.text,
                                        buttons: Ext.MessageBox.OKCANCEL,
                                        scope: this,
                                        animateTarget: item,
                                        fn: function (btn, text) {
                                            if (btn == 'ok') {
                                                const child = {...record.data};
                                                Ext.getCmp('mainmenutab').remove(record.data.parentFolder);
                                                jsCode.reName(pId, record.data.text, text, record.parentNode.data.parentFolder);
                                                child.text = text;
                                                let parentFolder = record.parentNode.data.parentFolder;
                                                if (parentFolder == undefined) parentFolder = '';
                                                child.parentFolder = parentFolder + '/' + text;
                                                child.icon = getFileIcon(text);
                                                record.parentNode.replaceChild(child, record);
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
                                icon: 'images/cross.svg',
                                handler: function () {
                                    showConfirm(`是否删除[${record.data.text}]?`, function (text) {
                                        if (record.data.type == 'folder') {
                                            jsCode.unLinkFolder(pId, record.data.parentFolder);
                                        } else {
                                            jsCode.unLinkFile(pId, record.data.parentFolder);
                                        }
                                        record.parentNode.removeChild(record);
                                        Ext.getCmp('mainmenutab').remove(record.data.parentFolder);
                                    }, item, Ext.MessageBox.ERROR);
                                }
                            }
                        ]
                    }).showAt(event.getPoint());
                }
            }
        };
        this.callParent(arguments);
    }
});
