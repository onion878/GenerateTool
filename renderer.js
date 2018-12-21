const shell = require('shelljs'), fs = require('fs');
const libFolders = ['graceful-fs', 'is-promise', 'lodash', 'lowdb', 'shelljs'];
const path = __dirname,{name} = require('./package.json');
shell.cd(`${path}/dist/${name}-win32-x64`);
shell.exec('mkdir data');
shell.exec('mkdir jscode');