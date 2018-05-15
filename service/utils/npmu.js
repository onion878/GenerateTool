var npm    = require('global-npm');
var fs     = require('fs');
var path   = require('path');
var LOAD_ERR    = 'NPM_LOAD_ERR',
    INSTALL_ERR = 'NPM_INSTALL_ERR',
    VIEW_ERR    = 'NPM_VIEW_ERR';

/**
 * Created with IntelliJ IDEA.
 * User: leiko
 * Date: 30/01/14
 * Time: 10:28
 */
var npmu = function (options, callback) {
    callback = callback || function () {};

    var name         = options.name,
        pkgName      = options.pkgName || name,
        installPath  = options.path || '.',
        forceInstall = options.forceInstall || false,
        localInstall = options.localInstall || false,
        npmLoad      = options.npmLoad || {loglevel: 'silent'},
        savedPrefix  = null,
        names  = options.names,
        multiple = options.multiple;

    function viewCallback(installedVersion)  {
        return function (err, view) {
            if (err) {
                // reset npm.prefix to saved value
                npm.prefix = savedPrefix;
                err.code = VIEW_ERR;
                return callback(err);
            }

            // npm view success
            var latestVersion = Object.keys(view)[0];
            if ((typeof latestVersion !== 'undefined') && (latestVersion === installedVersion)) {
                // reset npm.prefix to saved value
                npm.prefix = savedPrefix;
                return callback();
            } else {
                npm.commands.uninstall( [name], installCallback);
            }
        }
    }

    function checkInstalled(isTarball) {
        var module = name;

        if (isTarball) {
            module = name;
            if (pkgName === name) {
                console.warn('npmu warn: install "'+name+'" from tarball/folder without options.pkgName specified => forceInstall: true');
            }
        }

        // check that version matches
        fs.readFile(path.resolve(installPath, 'node_modules', pkgName, 'package.json'), function (err, pkgRawData) {
            if (err) {
                // hmm, something went wrong while reading module's package.json file
                // lets try to reinstall it just in case
                return npm.commands.uninstall( [module], installCallback);
            }
            return npm.commands.uninstall( [module], installCallback);
        });
    }

    function installCallback(err, result) {
        // reset npm.prefix to saved value
        npm.prefix = savedPrefix;

        if (err) {
            err.code = INSTALL_ERR;
        }

        callback(err, result);
    }

    function loadCallback(err) {
        if (err) {
            err.code = LOAD_ERR;
            return callback(err);
        }

        // npm loaded successfully
        savedPrefix = npm.prefix; // save current npm.prefix
        npm.prefix = installPath; // change npm.prefix to given installPath
        if (!name) {
            // just want to do an "npm install" where a package.json is
            npm.commands.uninstall( [], installCallback);

        } else if (localInstall) {
            if (forceInstall) {
                // local install won't work with version specified
                npm.commands.uninstall( [name], installCallback);
            } else {
                // check if there is already a local install of this module
                fs.readFile(path.resolve(name, 'package.json'), 'utf8', function (err, sourcePkgData) {
                    if (err) {
                        // reset npm.prefix to saved value
                        npm.prefix = savedPrefix;
                        callback(err);

                    } else {
                        try {
                            var sourcePkg = JSON.parse(sourcePkgData)
                        } catch (err) {
                            // reset npm.prefix to saved value
                            npm.prefix = savedPrefix;
                            callback(err);
                            return;
                        }

                        var pkgName = sourcePkg.name || path.basename(name);
                        fs.readFile(path.resolve(installPath, 'node_modules', pkgName, 'package.json'), 'utf8', function (err, targetPkgData) {
                            if (err) {
                                // file probably doesn't exist, or is corrupted: install
                                // local install won't work with version specified
                                npm.commands.uninstall( [name], installCallback);
                            } else {
                                // there is a module that looks a lot like the one you want to install: do some checks
                                try {
                                    var targetPkg = JSON.parse(targetPkgData);
                                } catch (err) {
                                    // reset npm.prefix to saved value
                                    npm.prefix = savedPrefix;
                                    callback(err);
                                    return;
                                }
                                npm.commands.uninstall( [name], installCallback);
                            }
                        });
                    }
                });
            }
        } else {
            if (forceInstall) {
                // reinstall package module
                if (name.indexOf('/') === -1) {
                    // not a tarball
                    npm.commands.uninstall( [name], installCallback);
                } else {
                    // do not specify version for tarball
                    npm.commands.uninstall( [name], installCallback);
                }

            } else {
                // check if package is installed
                checkInstalled(name.indexOf('/') !== -1);
            }
        }
    }

    function loadCallbackAll(err) {
        if (err) {
            err.code = LOAD_ERR;
            return callback(err);
        }

        // npm loaded successfully
        savedPrefix = npm.prefix; // save current npm.prefix
        npm.prefix = installPath; // change npm.prefix to given installPath
        if (!names) {
            // just want to do an "npm install" where a package.json is
            npm.commands.uninstall( [], installCallbackAll);
        } else {
            npm.commands.uninstall( names, installCallbackAll);
        }
    }

    function installCallbackAll(err, result) {
        // reset npm.prefix to saved value
        npm.prefix = savedPrefix;
        err = null;
        callback(err, result);
    }

    npm.load(npmLoad, loadCallback);
    npm.load(npmLoad, loadCallbackAll);
};

npmu.LOAD_ERR    = LOAD_ERR;
npmu.INSTALL_ERR = INSTALL_ERR;
npmu.VIEW_ERR    = VIEW_ERR;

npmu.NPM_VERSION = npm.version;

module.exports = npmu;