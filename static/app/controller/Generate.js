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
                geFileData.setDataEdit(dom.pId, dom.params.path, dom.params.folder, val);
            } else {
                geFileData.setDataPreview(dom.pId, dom.params.path, dom.params.folder, val);
            }
        };
    },
    editFile: function (btn) {
        this.type = 'edit';
        const code = btn.up('generate').down('minicode').codeEditor;
        code.setValue(this.getContent(btn.up('generate')));
        code.updateOptions({readOnly: false});
    },
    preview: function (btn) {
        this.type = 'view';
        const code = btn.up('generate').down('minicode').codeEditor;
        code.updateOptions({readOnly: true});
        const tpl = swig.compile(code.getValue());
        const output = tpl(controlData.getModuleData(btn.up('generate').pId));
        code.setValue(output);
    },
    getContent: function (that) {
        const val = geFileData.getOneData(that.pId, that.params.path);
        let content = '';
        if (val != undefined) {
            content = val.content;
        }
        return content;
    }
});