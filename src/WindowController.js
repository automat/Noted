const WindowAction = require('./WindowAction');

function WindowController(window,document){
    this._window     = window;
    this._document   = document;

    var self = this;
    this._window.on('window-ready',function(){
        self._document.emit('document-ready');
    });
}

WindowController.prototype.getDocument = function(){
    return this._document;
};

WindowController.prototype.getWindow = function(){
    return this._window;
};

WindowController.prototype.openWindow = function(){
    this._window.open();
};

WindowController.prototype.closeWindow = function(){
    this._window.close();
};

WindowController.prototype.focusWindow = function(){
    this._window.focus();
};

WindowController.prototype.shouldCloseWindow = function(){
    this._window.close();
};

WindowController.prototype.syncWindowDocumentTitleName = function(){
    this._window.sendAction(WindowAction.DOCUMENT_NAME_SYNC,this._document.getModelName());
};

WindowController.prototype.setWindowDocumentEdited = function(edited){
    this._window.sendAction(WindowAction.DOCUMENT_EDIT,edited);
};

module.exports = WindowController;

