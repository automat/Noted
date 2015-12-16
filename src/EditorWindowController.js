const path = require('path');

const WindowController = require('./WindowController');
const EditorWindow     = require('./EditorWindow');
const WindowAction     = require('./WindowAction');
const EditorAction     = require('./EditorAction');
const EditorResponse   = require('./EditorResponse');

function EditorWindowController(document){
    WindowController.call(this, new EditorWindow(this), document);

    var self = this;

    function syncDocument(data){
        self._document.setModelName(data.name);
        self._document.setModelContent(data.content);
        self._document.setDocumentEdited(data.edited);
    }

    this._window.on('response',function(type,data){
        switch(type){
            case EditorResponse.DOCUMENT_SYNC_FOR_CLOSE:
                syncDocument(data);
                self._document.saveDocumentAndClose();
                break;

            case EditorResponse.DOCUMENT_SYNC_FOR_DUPLICATE:
                syncDocument(data);
                self._document.constructor.createFromDocument(
                    self._document.getDocumentController(),
                    self._document
                );
                break;

            case EditorResponse.DOCUMENT_SYNC_FOR_SAVE:
                syncDocument(data);
                self._document._saveDocument(self._document.getModelPath());
                break;

            case EditorResponse.DOCUMENT_NAME_CHANGE:
                self._document.setModelName(data);
                break;

            case EditorResponse.DOCUMENT_EDITED_STATUS:
                self._document.setDocumentEdited(data);
                break;
        }
    });
}

EditorWindowController.prototype = Object.create(WindowController.prototype);
EditorWindowController.prototype.constructor = EditorWindowController;

EditorWindowController.prototype.syncWindowDocument = function(){
    this._window.sendAction(EditorAction.LOAD_DOCUMENT, {
        content   : this._document.getModelContent(),
        directory : this._document.getModelDirectory(),
        name      : this._document.getModelName(),
        edited    : this._document.isDocumentEdited()
    });
};

EditorWindowController.prototype.syncDocumentState = function(){
    this._window.sendAction(EditorAction.SYNC_DOCUMENT_STATE,{
        directory : this._document.getModelDirectory(),
        name      : this._document.getModelName(),
        edited    : this._document.isDocumentEdited()
    });
};

EditorWindowController.prototype.syncDocumentForDuplicate = function(){
    this._window.sendAction(EditorAction.SYNC_DOCUMENT_FOR_DUPLICATE,null);
};

EditorWindowController.prototype.syncDocumentForSave = function(){
    this._window.sendAction(EditorAction.SYNC_DOCUMENT_FOR_SAVE,null);
};

EditorWindowController.prototype.shouldCloseWindow = function(){
    this._window.sendAction(WindowAction.SHOULD_CLOSE,null);
};

EditorWindowController.prototype.openWindow = function(){
    this._window.open();
    this.syncWindowDocument();
};

EditorWindowController.prototype.reloadWindow = function(){
    this.syncWindowDocument();
    this._window.focus();
};


module.exports = EditorWindowController;