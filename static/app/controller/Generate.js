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
                let output = val;
                try{
                    const tpl = swig.compile(val);
                    output = tpl(controlData.getModuleData(dom.pId));
                }catch(e){}
                geFileData.setDataEdit(dom.params.fileId, dom.pId, val, output);
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
        this.type = 'view';
        const params = btn.up('generate').params;
        const vsCode = btn.up('generate').down('minicode');
        const code = vsCode.codeEditor;
        code.updateOptions({
            readOnly: true
        });
        if(params.updateType == 'add') {
            const tpl = swig.compile(code.getValue());
            const output = tpl(controlData.getModuleData(btn.up('generate').pId));
            code.setValue(output);
        } else {
            const {file} = geFileData.getOneData(params.fileId);
            if(file.trim().length == 0) {
                showError('未设置修改文件,无法预览!');
                return;
            }
            const d = jsCode.runNodeJs(`const file = '${file}';` + code.getValue());
            if (d instanceof Promise) {
                d.then(v => {
                    code.setValue(v);
                });
            } else {
                if(d != undefined)
                    code.setValue(d);
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