Ext.define('MyAppNamespace.controller.Generate', {
    extend: 'Ext.app.Controller',
    views: ['generate.generate'],
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
        const params = btn.up('generate').params;
        const vsCode = btn.up('generate').down('minicode');
        const code = vsCode.codeEditor;
        code.updateOptions({
            readOnly: true
        });
        if (params.updateType == 'add') {
            try {
                const tpl = swig.compile(code.getValue());
                const output = tpl(controlData.getModuleData(btn.up('generate').pId));
                code.setValue(output);
            } catch (e) {
                that.editFile(btn);
                console.log(e);
                showError('模板错误无法预览!');
            }
        } else {
            const {file} = geFileData.getOneData(params.fileId);
            if (file.trim().length == 0) {
                that.editFile(btn);
                showError('未设置修改文件,无法预览!');
                return;
            }
            try {
                const tplFile = swig.compile(file);
                const f = tplFile(controlData.getModuleData(btn.up('generate').pId)).replace(/\\/g, '\/');
                const d = jsCode.runNodeJs(`const content = \`${require('fs').readFileSync(f, 'utf8').replace(/\$/g, '\\\$').replace(/\`/g, '\\\`')}\`;` + code.getValue());
                if (d instanceof Promise) {
                    d.then(v => {
                        code.setValue(v);
                    });
                } else {
                    if (d != undefined) {
                        code.setValue(d);
                    }
                }
            } catch (e) {
                that.editFile(btn);
                console.log(e);
                showError('模板错误无法预览!');
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