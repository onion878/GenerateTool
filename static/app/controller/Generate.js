Ext.define('OnionSpace.controller.Generate', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.Generate',
    type: 'edit',
    init: function () {
        this.control({
            'generate': {
                render: this.onPanelRendered
            },
            'toolbar button[action=edit]': {
                click: this.editFile
            },
            'toolbar button[action=preview]': {
                click: this.preview
            }
        });
    },
    onPanelRendered: function (dom) {
        const that = this;
        dom.codeEditor.changeValue = function () {
            const val = dom.codeEditor.codeEditor.getValue();
            if (that.type == "edit") {
                geFileData.setDataEdit(dom.params.fileId, dom.pId, val);
            } else {
                geFileData.setDataPreview(dom.params.fileId, dom.pId, val);
            }
        };
    },
    editFile: function (btn) {
        this.type = 'edit';
        const vsCode = btn.up('generate').down('minicode');
        const code = vsCode.codeEditor;
        code.setValue(this.getContent(btn.up('generate')));
        code.updateOptions({
            readOnly: false
        });
    },
    preview: function (btn) {
        const that = this;
        that.type = 'view';
        const dom = btn.up('generate');
        const params = dom.params;
        const vsCode = dom.down('minicode');
        const code = vsCode.codeEditor;
        code.updateOptions({
            readOnly: true
        });
        dom.mask('处理中...');
        if (params.updateType == 'add') {
            nodeRun(`compileTemplate('${params.fileId}')`).then(output => {
                code.setValue(output);
                dom.unmask();
            }).catch(e => {
                dom.down('button[action=edit]').click();
                dom.unmask();
                console.error(e);
                showError(e);
            });
        } else {
            const {file} = geFileData.getOneData(params.fileId);
            if (file.trim().length == 0) {
                that.editFile(btn);
                showError('Error 未设置修改文件,无法预览!');
                return;
            }
            try {
                const tplFile = swig.compile(file);
                const f = tplFile(controlData.getModuleData(btn.up('generate').pId)).replace(/\\/g, '\/');
                const d = jsCode.runNodeJs(`const content = \`${require('fs').readFileSync(f, 'utf8').replace(/\\/g, '\\\\').replace(/\$/g, '\\$').replace(/\`/g, '\\`')}\`;` + code.getValue());
                if (d instanceof Promise) {
                    d.then(v => {
                        code.setValue(v);
                        dom.unmask();
                    }).catch(e => {
                        console.error(e);
                        dom.unmask();
                        dom.down('button[action=edit]').click();
                        showError(e);
                    });
                } else {
                    dom.unmask();
                    if (d != undefined) {
                        code.setValue(d);
                    }
                }
            } catch (e) {
                console.error(e);
                dom.unmask();
                dom.down('button[action=edit]').click();
                showError(e);
            }
        }
    },
    getContent: function (that) {
        const val = geFileData.getOneData(that.params.fileId);
        let content = '';
        if (val != undefined) {
            content = val.content;
        }
        return content;
    }
});
