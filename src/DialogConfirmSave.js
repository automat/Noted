const dialog = require('dialog');

function open(documentName){
    return dialog.showMessageBox(
        null,{
            type    : 'warning',
            buttons : ['Cancel','Save','Don´t Save'],
            title   : 'Save Document Confirm',
            message : 'Do you want to save the changes you made to "' + documentName +  '"?',
            detail  : 'Your changes will be lost if you don\'t save them.'
        }
    )
}

module.exports = {
    open : open
};