const os = require('os');
const pty = require('node-pty');
const Terminal = require('xterm').Terminal;
const fit = require('xterm/lib/addons/fit/fit');
const {remote} = require('electron');

class Commands {
    constructor() {
        this.term = null;
        this.nowPty = null;
        this.systemCmd = false;
        this.workFlag = false;
        this.config = require('../dao/system');
    }

    init(element) {
        const that = this;
        return new Promise((resolve, reject) => {
            let terminal = this.config.getConfig('terminal');
            if (terminal.trim().length == 0) {
                terminal = process.env[os.platform() === 'win32' ? 'COMSPEC' : 'SHELL'];
                this.systemCmd = true;
            }
            if (this.nowPty == null) {
                that.initNodePty(terminal, resolve, element);
            } else {
                that.initXterm(terminal, resolve, element);
                resolve(that.nowPty, that.term);
            }
        });
    }

    initNodePty(userBash, resolve, element) {
        const that = this;
        const ptyProcess = pty.spawn(userBash, [], {
            name: 'xterm-color',
            cols: 180,
            rows: 30,
            cwd: process.env.HOME,
            env: process.env
        });
        that.nowPty = ptyProcess;
        that.initXterm(userBash, resolve, element);
        that.nowPty.on('data', function (data) {
            if (data.toLocaleUpperCase().indexOf('(Y/N)?') > -1) {
                that.nowPty.write('Y\r');
            }
            if (data.indexOf('running done!') > -1) {
                remote.getCurrentWindow().send('terminal-end', 'end');
            }
            that.term.write(data);
        });
        resolve(that.nowPty, that.term);
    }

    initXterm(userBash, resolve, element) {
        const that = this;

        Terminal.applyAddon(fit);
        // Initialize xterm.js and attach it to the DOM
        that.term = new Terminal({
            fontFamily: 'Consolas',
            theme: {
                foreground: '#000',
                background: '#ffffff',
                cursor: '#000',
                selection: 'rgba(255, 255, 255, 0.3)',
                black: '#ffffff',
                red: '#e06c75',
                brightRed: '#e06c75',
                green: '#A4EFA1',
                brightGreen: '#A4EFA1',
                brightYellow: '#EDDC96',
                yellow: '#EDDC96',
                magenta: '#e39ef7',
                brightMagenta: '#e39ef7',
                cyan: '#5fcbd8',
                brightBlue: '#5fcbd8',
                brightCyan: '#5fcbd8',
                blue: '#5fcbd8',
                white: '#d0d0d0',
                brightBlack: '#808080',
                brightWhite: '#000'
            }
        });
        that.term.open(element);
        that.term.fit();
    }

    fitTerm() {
        if (this.term != null) {
            this.term.fit();
        }
    }

    resetTerm() {
        this.term.reset()
    }

    clearTerm() {
        this.term.clear();
    }

    cancelPty() {
        this.nowPty.write("\x03\r");
    }

    cdTargetFolder(folder) {
        if (this.workFlag) return;
        if (this.systemCmd) {
            this.nowPty.write(`cd /d ${folder}\r`);
        } else {
            this.nowPty.write(`cd ${folder}\r`);
        }
        this.workFlag = true;
    }

    write(shell) {
        this.nowPty.write(shell + "\r");
    }

    destroy() {
        if (this.nowPty != null) {
            this.nowPty.destroy();
            this.nowPty = null;
            this.term = null;
            this.systemCmd = false;
            this.workFlag = false;
        }
    }
}

module.exports = new Commands();
