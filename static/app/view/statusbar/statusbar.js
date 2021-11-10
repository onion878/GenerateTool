Ext.define('OnionSpace.view.statusbar.statusbar', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.statusbar',
    html: '<div class="states-toolbar"></div>',
    progress: null,
    tool: null,
    listeners: {
        render: function (c) {
            const that = this;
            let child = `<div class="states-content">`;
            if (that.float) {
                child = `<div class="states-content" style="float:${that.float};">`;
            }
            let changeFlag = false;
            that.list.forEach(l => {
                let cls = '';
                if (l.active) {
                    cls = ' class="active"';
                    changeFlag = true;
                }
                if (l.img) {
                    child = child + `<a${cls}`;
                    if (l.id) {
                        child = child + ` id="${l.id}" `;
                    }
                    child = child + `><img src="${l.img}"/>${l.name}</a>`;
                } else {
                    child = child + `<a${cls}`;
                    if (l.id) {
                        child = child + ` id="${l.id}" `;
                    }
                    child = child + `>${l.name}</a>`;
                }
            });
            child = child + '</div>';
            if (that.msg) {
                child = child + `<div class="status-msg" id="status-msg"></div><div id="progress" class="status-progress" style="float: right;"></div>`;
            }
            if (that.tool) {
                child = child + `<div id="${that.tool.id}" title="${that.tool.title}" class="status-tool" style="background: url('${that.tool.image}') center center no-repeat;width: 21px;padding-left: 25px;cursor: pointer;${that.tool.style}"></div>`;
            }
            const main = c.el.dom.querySelector('.states-toolbar');
            main.innerHTML = child;
            that.infoPanel = Ext.get(c.el.dom).query('.status-msg')[0];
            const btn = Ext.get(c.el.dom).query('a');
            that.list.forEach((l, i) => {
                btn[i].addEventListener("click", function (dom) {
                    if (changeFlag || that.toggle) {
                        that.changeCls(btn, this);
                    }
                    that.click(that, this, l.name);
                });
            });
            if (that.tool) {
                const tool = Ext.get(c.el.dom).query('.status-tool')[0];
                tool.addEventListener("click", function () {
                    that.tool.click(that, this);
                });
            }
        }
    },
    initProgress: function () {
        this.progress = Ext.create('Ext.ProgressBar', {
            renderTo: document.getElementById("progress"),
            width: 250,
            height: 23
        });

    },
    setProgress: function (text, value) {
        const that = this;
        if (that.progress == null) {
            that.initProgress();
        }
        this.progress.show();
        that.progress.updateProgress(value, text, true);
    },
    closeProgress: function () {
        if (this.progress != null) {
            this.progress.hide();
        }
    },
    initComponent: function () {
        let style = '';
        if (this.type == 'vertical') {
            this.width = 20;
            style = `width: ${this.param}px;height: ${this.param}px`;
        }
        this.html = `<div class="states-toolbar ${this.type == 'vertical' ? 'vertical' : ''}" style="${style}"></div>`;
        this.callParent(arguments);
    },
    click: function (that, dom) {
    },
    changeCls: function (btn, dom) {
        btn.forEach(b => {
            b.className = '';
        });
        dom.className = 'active';
    }
});
