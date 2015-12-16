const dialog = require('dialog');

var settings = noted.settings;

var options = {
    filters : [
        {name : 'Markdown', extensions : ['md']}
    ],
    properties : ['openFile','createDirectory','multiSelections']
};

function open(){
    return dialog.showOpenDialog(null,options);
}

module.exports = {
    open : open
};