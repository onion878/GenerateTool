const fs = require('fs');
const path = require('path');
const shell = require('shelljs');

function copyFileSync( source, target ) {

    let targetFile = target;

    //if target is a directory a new file with the same name will be created
    if ( fs.existsSync( target ) ) {
        if ( fs.lstatSync( target ).isDirectory() ) {
            targetFile = path.join( target, path.basename( source ) );
        }
    }

    fs.writeFileSync(targetFile, fs.readFileSync(source));
}

function copyFolderRecursiveSync( source, target ) {
    let files = [];
    //check if folder needs to be created or integrated
    const targetFolder = path.join( target, path.basename( source ) );
    if ( !fs.existsSync( targetFolder ) ) {
        fs.mkdirSync( targetFolder );
    }

    //copy
    if ( fs.lstatSync( source ).isDirectory() ) {
        files = fs.readdirSync( source );
        files.forEach( function ( file ) {
            const curSource = path.join( source, file );
            if ( fs.lstatSync( curSource ).isDirectory() ) {
                copyFolderRecursiveSync( curSource, targetFolder );
            } else {
                copyFileSync( curSource, targetFolder );
            }
        } );
    }
}
const source = path.join(__dirname, 'node_modules/monaco-editor/min/vs');
const target = path.join(__dirname, 'static');
copyFolderRecursiveSync(source, target);
shell.cp('-R', path.join(__dirname, 'node_modules/xterm/dist/xterm.css'), path.join(__dirname, 'static/css'));
shell.cd('static');
shell.exec('git clone https://github.com/onion878/Ext.git');