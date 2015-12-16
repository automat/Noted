var dialog = require('dialog');

function open(title,detail){
    dialog.showMessageBox(null,{
        type : 'warning',
        buttons : ['OK'],
        title : 'Warning',
        message : title,
        detail : detail
    })
}

module.exports = {
    open : open
};