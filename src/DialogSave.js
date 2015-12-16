const path   = require('path');
const dialog = require('dialog');

var settings = noted.settings;

var filters = [
    {name : 'Markdown', extensions : ['md']}
];

function open(filename){
    var result = dialog.showSaveDialog(null,{
        defaultPath : filename,
        filters : filters
    });

    if(result !== undefined){
        settings.document.dir_last = path.dirname(result);
    }

    return result;
}

module.exports = {
    open : open
};