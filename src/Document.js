const fs = require('fs');
const path = require('path');

const DialogOpen = require('./DialogOpen');
const DialogSave = require('./DialogSave');
const DialogConfirmSave = require('./DialogConfirmSave');

const Model = require('./Model');
const EditorWindowController = require('./EditorWindowController');

const EventEmitter = require('events').EventEmitter;

var id = 0;
var idNew = 0;

function Document(controller){
    EventEmitter.call(this);

    this._controller = controller;
    this._model = new Model();

    this._id = id++;
    this._copyCount = 0;
    this._edited = false;

    this._windowContoller = new EditorWindowController(this);
}

Document.prototype = Object.create(EventEmitter.prototype);
Document.prototype.constructor = Document;

Document.prototype.reloadFromPath = function(url){
    this._model.name = path.basename(url);
    this._model.content = fs.readFileSync(url, 'utf8');
    this._model.path = url;
    this._model.directory = path.dirname(url);

    this._edited = false;
    this._windowContoller.reloadWindow();
};

Document.prototype._saveDocument = function(path){
    var content = this._model.content;

    if(path === null || path === undefined){
        var result = DialogSave.open(this._model.name);
        if(result === undefined){
            return;
        }
        fs.writeFileSync(result, content);
        this.setModelPath(result);

    } else {
        fs.writeFileSync(path, content);
    }

    this._edited = false;
    this._windowContoller.syncDocumentState();
};

Document.prototype.saveDocument = function(){
    this._windowContoller.syncDocumentForSave();
};

Document.prototype.saveDocumentAs = function(){

};

Document.prototype.duplicate = function(){
    this._windowContoller.syncDocumentForDuplicate();
};

Document.prototype.renameDocument = function(){

};


Document.prototype.moveDocumentTo = function(directory){

};

Document.prototype.saveDocumentAndClose = function(){
    this.focus();

    if(!this._edited){
        this.close();
        return;
    }

    var name = this._model.name;

    switch(DialogConfirmSave.open(name)){
        case 0:
            //cancelled
            this.emit('document-close-canceled');
            break;

        case 1:
            this._saveDocument(this._model.path);
            break;

        case 2:
            //discard
            this.close();
            break;
    }
};

Document.prototype.focus = function(){
    this._windowContoller.focusWindow();
};

Document.prototype.close = function(){
    this._windowContoller.closeWindow();
    this._controller.removeDocument(this);
};

Document.prototype.shouldClose = function(){
    this._windowContoller.shouldCloseWindow();
};

Document.prototype.setDocumentEdited = function(edited){
    this._edited = edited;
};

Document.prototype.isDocumentEdited = function(){
    return this._edited;
};

Document.prototype.setModelName = function(name){
    this._model.name = name;

    if(this._model.path === null){
        return;
    }
    this._model.path = path.join(this._model.directory, name);
};

Document.prototype.setModelPath = function(path_){
    this._model.path = path_;

    if(path === null){
        this._model.directory = null;
        return;
    }
    this._model.name = path.basename(path_);
    this._model.directory = path.dirname(path_);
};

Document.prototype.setModelDirectory = function(directory){
    this._model.directory = directory;

    if(directory === null){
        this._model.path = null;
        return;
    }

    this._model.path = path.join(directory, this._model.name);
};

Document.prototype.setModelContent = function(content){
    this._model.content = content;
};

Document.prototype.getModelName = function(){
    return this._model.name;
};

Document.prototype.getModelPath = function(){
    return this._model.path;
};

Document.prototype.getModelDirectory = function(){
    return this._model.directory;
};

Document.prototype.getModelContent = function(){
    return this._model.content;
};

Document.prototype.getDocumentController = function(){
    return this._controller;
};

Document.prototype.getWindowController = function(){
    return this._windowContoller;
};

Document.createNew = function(controller){
    var document = new Document(controller);

    document.setModelName('Untitled' + (idNew > 0 ? (' ' + idNew) : '') + '.md');
    document.setModelContent('');

    controller.addDocument(document);
    document.getWindowController().openWindow();
    idNew++;

    return document;
};

Document.createFromPath = function(controller, url){
    var document = new Document(controller);

    document.setModelPath(url);
    document.setModelContent(fs.readFileSync(url, 'utf8'));

    controller.addDocument(document);
    document.getWindowController().openWindow();

    return document;
};

Document.createFromDocument = function(controller, document){
    var document_ = new Document(controller);
    var name = document.getModelName();

    document_.setModelName(name.substr(0, name.lastIndexOf('.')) + ' (' + (++document._copyCount) + ').md');
    document_.setModelContent(document.getModelContent());
    document_.setDocumentEdited(true);

    controller.addDocument(document_);
    document_.getWindowController().openWindow();

    return document_;
};

module.exports = Document;