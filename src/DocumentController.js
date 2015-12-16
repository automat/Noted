const Document      = require('./Document');
const DialogOpen    = require('./DialogOpen');
const DialogWarning = require('./DialogWarning');

const EventEmitter = require('events').EventEmitter;

const MAX_DOCUMENTS = 10;

var instance = null;

function openWarningMaxDocuments(){
    DialogWarning.open('Document Session Limit Reached','Please close documents before proceeding.');
}

function DocumentController(){
    EventEmitter.call(this);
    if(instance !== null){
        throw new Error('DocumentController is a singleton.');
    }
    this._closingAllDocuments = false;
    this._documents = [];
}

DocumentController.prototype = Object.create(EventEmitter.prototype);
DocumentController.prototype.constructor = EventEmitter;

DocumentController.prototype.newDocument = function(){
    if(this._documents.length >= MAX_DOCUMENTS){
        openWarningMaxDocuments();
        return;
    }
    Document.createNew(this);
};

DocumentController.prototype.openDocument = function(){
    if(this._documents.length >= MAX_DOCUMENTS){
        openWarningMaxDocuments();
        return;
    }

    var paths = DialogOpen.open();
    if(paths === undefined){
        return;
    }

    var documentsUsed   = [];
    var documentsUnused = [];
    var document;

    for(var i = 0, l = this._documents.length; i < l; ++i){
        document = this._documents[i];
        if(document.getModelPath() === null && document.isDocumentEdited()){
            documentsUnused.push(document);
            continue;
        }
        documentsUsed.push(document);
    }

    for(var i = 0, l = paths.length; i < l; ++i){
        var path = paths[i];
        var open = false;

        for(var j = 0, k = documentsUsed.length; j < k; ++j){
            document = documentsUsed[j];

            if(document.getModelPath() === path){
                document.focus();
                open = true;
            }
        }

        if(open){
            continue;
        }

        if(documentsUnused.length !== 0){
            document = documentsUnused[0];
            document.reloadFromPath(path);

            documentsUsed.push(document);
            documentsUnused.shift();
            continue;
        }

        Document.createFromPath(this,path);
        documentsUsed.push(this._documents[this._documents.length - 1]);
    }
};

DocumentController.prototype.addDocument = function(document){
    if(this._documents.indexOf(document) !== -1){
        return;
    }
    this._documents.push(document);

    var self = this;
    document.on('document-close-canceled',function(){
        self.cancelCloseAllDocuments();
    });
};

DocumentController.prototype.removeDocument = function(document){
    this._documents.splice(this._documents.indexOf(document),1);

    if(this._documents.length === 0){
        this.emit('all-documents-closed');
        return;
    }

    if(this._closingAllDocuments){
        this._documents[this._documents.length - 1].shouldClose();
    }
};

DocumentController.prototype.getNumDocuments = function(){
    return this._documents.length;
};

DocumentController.prototype.getDocuments = function(){
    return this._documents;
};

DocumentController.prototype.getCurrentDocument = function(){
    var documentCurrent = null;

    for(var i = 0, l = this._documents.length; i < l; ++i){
        var document = this._documents[i];
        var window   = document.getWindowController().getWindow();
        if(window.isCurrent()){
            documentCurrent = document;
            break;
        }
    }

    return documentCurrent;
};

DocumentController.prototype.closeAllDocuments = function(){
    this._closingAllDocuments = true;
    var current = this.getCurrentDocument();
    if(current){
        current.shouldClose();
        return;
    }
    this._documents[this._documents.length - 1].shouldClose();
};

DocumentController.prototype.cancelCloseAllDocuments = function(){
    this._closingAllDocuments = false;
};

DocumentController.getShared = function(){
    if(instance === null){
        instance = new DocumentController();
    }
    return instance;
};

module.exports = DocumentController;

