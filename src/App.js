const app           = require('app');
const Menu          = require('menu');

const Settings           = require('./Settings');
const DocumentController = require('./DocumentController');

var menu = require('./Menu');
var documentController = new DocumentController();

if(app.makeSingleInstance(function() {
        var numDocuments = documentController.getNumDocuments();
        if (numDocuments !== 0) {
            var current = documentController.getCurrentDocument();
            if(current){
                current.focus();
            } else {
                documentController.getDocuments()[numDocuments-1].focus();
            }
        }
        return true;
    })
){
    app.quit();
}

menu.quit.click = function(){
    documentController.closeAllDocuments();
};

menu.fileNew.click = function(){
    documentController.newDocument();
};

menu.fileOpen.click = function(){
    documentController.openDocument();
};

menu.fileSave.click = function(){
    var document = documentController.getCurrentDocument();
    if(document === null){
        return;
    }
    document.saveDocument();
};

menu.fileClose.click = function(){
    var document = documentController.getCurrentDocument();
    if(document === null){
        return;
    }
    document.shouldClose();
};

menu.fileDuplicate.click = function(){
    var document = documentController.getCurrentDocument();
    if(document === null){
        return;
    }
    document.duplicate();
};


documentController.on('all-documents-closed',function(){
    app.quit();
});

app.on('window-all-closed', function(e){
    e.preventDefault();
});

app.on('ready', function(){
    Menu.setApplicationMenu(menu.menu);

    documentController.newDocument();
});