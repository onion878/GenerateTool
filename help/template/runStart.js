const fs = require('fs');
const swig = require('swig');
const shell = require('shelljs');
const data = require('./data.json');
const templates = require('./template.json');

swig.setDefaults({autoescape: false});
