const {
    app,
    BrowserWindow,
    dialog,
    Menu,
    ipcMain
} = require('electron');
app.showExitPrompt = true;
const path = require('path');
const url = require('url');
const fs = require('fs');
const shell = require('shelljs');
const need = require('require-uncached');
const pty = require('node-pty');
const {getDataPath, getPid} = require('./service/utils/help');
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow, loading, loadFlag = false, globalStoreDirPath;
app.allowRendererProcessReuse = false;
const variable = require('./service/utils/variable');
const os = require("os");

function createWindow() {
    // 预加载
    loading = new BrowserWindow({
        show: false,
        frame: false,
        width: 200,
        height: 200,
        opacity: 0.8
    });
    loading.loadFile('static/loading/loading.html').then(() => {
        loading.show();
    });
    loading.webContents.once('dom-ready', () => {
        // 加载正式窗口
        createMainWindow();
        setTimeout(() => {
            if (!loadFlag) {
                const systemConfig = need('./service/dao/system');
                if (systemConfig.getWin().maximal) {
                    mainWindow.maximize();
                }
                mainWindow.show();
                if (loading && loading != null) {
                    loading.hide();
                    loading.close();
                    loading = null;
                }
            }
        }, 10000);
    });
}

function createMainWindow() {
    globalStoreDirPath = getDataPath();
    if (!fs.existsSync(globalStoreDirPath)) {
        shell.mkdir('-p', globalStoreDirPath);
    }
    if (!fs.existsSync(globalStoreDirPath + '/data')) {
        fs.mkdirSync(globalStoreDirPath + '/data');
    }
    if (!fs.existsSync(globalStoreDirPath + '/jscode')) {
        fs.mkdirSync(globalStoreDirPath + '/jscode');
    }
    const systemConfig = need('./service/dao/system');
    let data = systemConfig.getWin();
    if (data.id == undefined) {
        data = {id: '', width: 800, height: 600, maximal: false, x: 100, y: 100};
    }
    let opacity = systemConfig.getConfig('win-opacity');
    if (opacity == null) {
        systemConfig.setConfig('win-opacity', 1);
        opacity = 1;
    }
    const icon = path.join(__dirname, 'static/images/code.png');
    // Create the browser window.
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false
        },
        width: data.width,
        height: data.height,
        show: false,
        frame: true,
        opacity: opacity,
        backgroundColor: 'black',
        title: '代码构建工具',
        icon: icon,
    });
    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, `static/index.html`),
        protocol: 'file:',
        slashes: true
    }));
    if (data.id == 'system') {
        mainWindow.setPosition(data.x, data.y);
    }
    variable.setCache("historyId", getPid());
    // Open the DevTools. debug
    // mainWindow.webContents.openDevTools();
    let menuItems = [
        {
            label: '文件',
            submenu: [
                {
                    id: 'change-mode',
                    label: '切换模板',
                    submenu: createFileMenu()
                },
                {
                    label: '新建模板',
                    click() {
                        mainWindow.webContents.executeJavaScript('createTemplate();');
                    }
                },
                {type: 'separator'},
                {
                    label: '本地模板',
                    click() {
                        let code = `openSome({id:'templet',title:'本地模板',type:'templet'})`;
                        mainWindow.webContents.executeJavaScript(code);
                    },
                },
                {
                    label: '在线模板',
                    click() {
                        let code = `openSome({id:'online-temp',title:'在线模板',type:'online-temp'})`;
                        mainWindow.webContents.executeJavaScript(code);
                    }
                },
                {
                    label: '更新模板',
                    click() {
                        let code = `updateNowTemplate()`;
                        mainWindow.webContents.executeJavaScript(code);
                    }
                },
                {type: 'separator'},
                {label: '退出', role: 'quit'}
            ]
        }, {
            label: '系统',
            submenu: [
                {
                    label: '设置',
                    click() {
                        let code = `openSome({id:'setting',title:'设置',type:'setting', icon: './images/set.svg'})`;
                        mainWindow.webContents.executeJavaScript(code);
                    }
                },
                {
                    label: '控制台',
                    click() {
                        mainWindow.webContents.openDevTools();
                    }
                },
                {type: 'separator'},
                {
                    label: '系统日志',
                    click() {
                        const code = `openSome({id:'logger',title:'系统日志',type:'logger', icon: './images/system-log.svg'})`;
                        mainWindow.webContents.executeJavaScript(code);
                    }
                },
                {
                    label: '操作历史',
                    click() {
                        const code = `openSome({id:'operation',title:'操作历史',type:'operation', icon: './images/history.svg'})`;
                        mainWindow.webContents.executeJavaScript(code);
                    }
                },
                {
                    label: '更新日志',
                    click() {
                        const code = `openSome({id:'welcome',title:'更新日志',type:'welcome', icon: './images/readme.svg'})`;
                        mainWindow.webContents.executeJavaScript(code);
                    }
                },
                {type: 'separator'},
                {
                    label: '重新启动',
                    click() {
                        dialog.showMessageBox(mainWindow, {
                            type: 'question',
                            buttons: ['否', '是'],
                            title: '提示',
                            defaultId: 1,
                            message: '是否重新启动?',
                            noLink: true
                        }).then(({response}) => {
                            if (response === 1) {
                                app.relaunch();
                                app.exit(0);
                            }
                        });
                    }
                },
                {
                    label: '注册账号',
                    click() {
                        mainWindow.webContents.executeJavaScript('register()');
                    }
                },
                {
                    label: '重新登录',
                    click() {
                        mainWindow.webContents.executeJavaScript('login()');
                    }
                },
                {
                    label: '停止脚本进程',
                    click() {
                        mainWindow.webContents.executeJavaScript(`closeNodeWin();Ext.getCmp('main-content').unmask();`);
                    }
                },
                {
                    label: '停止loading',
                    click() {
                        mainWindow.webContents.executeJavaScript(`Ext.getCmp('main-content').unmask();`);
                    }
                }
            ]
        }, {
            label: '帮助',
            submenu: [
                {
                    label: 'Github',
                    click() {
                        require("open")('https://github.com/onion878/GenerateTool');
                    }
                },
                {
                    label: '文档',
                    click() {
                        require("open")('https://generate-docs.netlify.com');
                    }
                },
                {
                    label: '关于',
                    click() {
                        const info = `Version: ${app.getVersion()}\r\tChrome: ${process.versions["chrome"]}\r\tNode: ${
                            process.versions["node"]
                        }\r\tElectron: ${
                            process.versions["electron"]
                        }\r\tAuthor: Onion\r\tEmail: a2214839296a@gmail.com`;
                        dialog.showMessageBox(mainWindow,
                            {
                                type: "info",
                                title: "关于",
                                message: "代码创建工具",
                                detail: info
                            }
                        ).then(() => {
                        });
                    }
                }
            ]
        }
    ];
    if (process.platform === 'darwin') {
        menuItems = menuItems.concat([
            {
                label: "编辑",
                submenu: [
                    {label: "撤销", accelerator: "CmdOrCtrl+Z", selector: "undo:"},
                    {label: "重做", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:"},
                    {type: "separator"},
                    {label: "剪切", accelerator: "CmdOrCtrl+X", selector: "cut:"},
                    {label: "拷贝", accelerator: "CmdOrCtrl+C", selector: "copy:"},
                    {label: "粘贴", accelerator: "CmdOrCtrl+V", selector: "paste:"},
                    {label: "选择所有", accelerator: "CmdOrCtrl+A", selector: "selectAll:"}
                ]
            }
        ]);
    }
    const menu = Menu.buildFromTemplate(menuItems);
    Menu.setApplicationMenu(menu);

    let msgIndex = 0;

    ipcMain.on('loading-msg', (event, msg) => {
        if (msgIndex == -1) return;
        msgIndex++;
        if (loading && loading != null) {
            loading.webContents.executeJavaScript(`setMsg('${msg}', ${msgIndex})`);
        }
    });

    ipcMain.on('loading-success', (event, arg) => {
        loadFlag = true;
        require('./service/utils/pool');
        if (data.maximal) {
            mainWindow.maximize();
        }
        mainWindow.show();
        if (loading && loading != null) {
            loading.hide();
            loading.close();
            loading = null;
        }
        msgIndex = -1;
    });

    const services = {
        data: './service/dao/modeData',
        parentData: './service/dao/mode',
        history: './service/dao/history',
        jsCode: './service/utils/JscodeUtil',
        systemConfig: './service/dao/system',
        userConfig: './service/dao/user',
        packageConfig: './service/dao/package',
        controlData: './service/dao/controls',
        fileData: './service/dao/file',
        geFileData: './service/dao/gefile',
        operation: './service/dao/HistoryDao',
        modeDataDao: './service/dao/ModeDataDao',
        operationDetail: './service/dao/HistoryDetailDao',
        utils: './service/utils/utils',
        help: './service/utils/help',
        runtimeDao: './service/dao/runtime',
    };

    ipcMain.on('setTitle', async (event, title) => {
        mainWindow.setTitle(title);
    });

    ipcMain.on('setOpacity', async (event, opacity) => {
        mainWindow.setOpacity(opacity);
    });

    ipcMain.on('showOpenDialog', async (event, config) => {
        event.returnValue = await dialog.showOpenDialog(config);
    });

    ipcMain.on('setProgressBar', async (event, progress) => {
        mainWindow.setProgressBar(progress);
    });

    ipcMain.on('quit', async (event) => {
        app.showExitPrompt = false;
        app.quit();
    });

    ipcMain.on('relaunch', async (event) => {
        app.relaunch();
        app.exit(0);
    });

    ipcMain.on('runCache', async (event, {method, args}) => {
        event.returnValue = await variable[method](...args);
    });

    ipcMain.on('run', async (event, {key, method, args}) => {
        event.returnValue = await need(services[key])[method](...args);
    });

    ipcMain.on('runServe', (event, {thread, key, method, args}) => {
        require(services[key])[method](...args).then(d => event.reply(thread + '-reply', {
            data: d,
            success: true
        })).catch(e => event.reply(thread + '-reply', {data: e, success: false}));
    });

    ipcMain.on('runCode', (event, {type}) => {
        if (type == 'refreshFile') {
            menuItems[0].submenu[0].submenu = createFileMenu();
            const menu = Menu.buildFromTemplate(menuItems);
            Menu.setApplicationMenu(menu);
        }
        event.returnValue = '';
    });


    let runWin = null;

    const nodeRun = async (content) => {
        if (runWin == null) {
            runWin = new BrowserWindow({
                webPreferences: {
                    nodeIntegration: true,
                    enableRemoteModule: true,
                    contextIsolation: false
                },
                title: '执行脚本进程运行中',
                parent: mainWindow,
                show: false,
                width: 200,
                height: 200
            });
            await runWin.loadURL(`file://${__dirname}/static/render.html`);
        }
        return await runWin.webContents.executeJavaScript(`moduleId = "${global.data['historyId']}";compileSwig();` + content);
    };

    const closeNodeWin = () => {
        try {
            runWin.close();
        } catch (e) {

        }
        runWin = null;
    };

    ipcMain.handle('nodeRun', async (event, content) => {
        return await nodeRun(content);
    });

    ipcMain.on('console', async (event, content) => {
        const msg = content.toString().replace(/\"/g, "“");
        await mainWindow.webContents.executeJavaScript(`showToast("${msg}")`);
    });

    ipcMain.on('closeNodeWin', async () => {
        closeNodeWin();
    });

    ipcMain.on('runFlag', async (event) => {
        event.returnValue = runWin != null;
    });
    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
    mainWindow.on('close', function (e) {
        if (app.showExitPrompt) {
            e.preventDefault();
            dialog.showMessageBox(mainWindow, {
                type: 'question',
                buttons: ['否', '是'],
                title: '提示',
                defaultId: 1,
                message: '是否退出?',
                noLink: true
            }).then(({response}) => {
                if (response === 1) {
                    app.showExitPrompt = false;
                    mainWindow.close();
                    if (loading && loading != null) {
                        loading.close();
                    }
                    let [x, y] = mainWindow.getPosition();
                    let [width, height] = mainWindow.getSize();
                    const maximal = mainWindow.isMaximized();
                    if (maximal) {
                        width = data.width;
                        height = data.height;
                        x = data.x;
                        y = data.y;
                    }
                    need('./service/dao/system').setWin({
                        id: 'system',
                        x: x,
                        y: y,
                        width: width,
                        height: height,
                        maximal: maximal
                    });
                    process.exit(0);
                }
            });
        }
    });

    let ptyProcess;

    ipcMain.on('closeTerminal', async (event, arg) => {
        ptyProcess.destroy();
    });

    ipcMain.on('terminal', async (event, arg) => {
        if (ptyProcess == null) {
            const env = process.env;
            if (process.platform == 'darwin') {
                env.PATH = env.PATH + ':/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/Library/Apple/usr/bin';
            }
            const systemConfig = need('./service/dao/system');
            let terminal = systemConfig.getConfig('terminal');
            if (terminal === undefined || terminal.trim().length == 0) {
                terminal = process.env[os.platform() == 'win32' ? 'powershell.exe' : 'bash'];
            }
            ptyProcess = pty.spawn(terminal, [], {
                cols: 180,
                rows: 30,
                cwd: process.cwd(),
                env: env
            });

            ptyProcess.onData(function (data) {
                mainWindow.webContents.send('terminal', data);
            });
        }
        ptyProcess.write(arg);
    });
}

function createFileMenu() {
    const mode = need('./service/dao/mode'), history = need('./service/dao/history');
    const files = [], historyId = history.getMode();
    mode.getAll().forEach(l => {
        if (l.id == historyId) {
            files.push({
                type: 'radio',
                label: l.text,
                checked: true,
                click: () => mainWindow.webContents.executeJavaScript(`changeTemplate('${l.id}');`)
            });
        } else {
            files.push({
                type: 'radio',
                label: l.text,
                checked: false,
                click: () => mainWindow.webContents.executeJavaScript(`changeTemplate('${l.id}');`)
            });
        }
    });
    return files;
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function () {
    createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
