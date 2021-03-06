const fs = require('fs');

const old = fs.readFileSync('./node_modules/node-pty/binding.gyp', 'utf8');
fs.writeFileSync('./node_modules/node-pty/binding.gyp', old.replace('-std=c++11', '-std=c++14'), 'utf8');
