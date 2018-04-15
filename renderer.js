const shell = require('shelljs'), fs = require('fs');
const libFolders = ['graceful-fs', 'is-promise', 'lodash', 'lowdb', 'shelljs'];
const path = __dirname,{name} = require('./package.json');
shell.cd(`${path}/release-builds/${name}-win32-x64`);
shell.exec('mkdir data');
shell.exec('mkdir jscode');
shell.cd(`${path}/release-builds/${name}-win32-x64/resources/app/node_modules`);
let dirList = fs.readdirSync(`${path}/release-builds/${name}-win32-x64/resources/app/node_modules`);
dirList.forEach(function (item) {
    let rm = true;
    libFolders.forEach(function (lib) {
        if(item === lib) {
            rm = false;
        }
    });
    if(rm) {
        shell.rm('-rf', item);
    }
});
shell.cd(`${path}/release-builds/${name}-win32-x64/resources/app`);
shell.rm('-rf', 'data');
shell.rm('-rf', 'renderer.js');
shell.rm('-rf', 'README.md');
shell.rm('-rf', 'package-lock.json');
shell.rm('-rf', 'LICENSE.md');
shell.rm('-rf', '.idea');
shell.rm('-rf', '.svn');