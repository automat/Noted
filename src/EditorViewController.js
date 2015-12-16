const ViewController = require('./ViewController');
const EditorView = require('./EditorView');

function EditorViewController(htmlWindow){
    ViewController.call(this,htmlWindow,new EditorView(this));

    var self = this;
    this._view.on('response',function(type,data){
        switch(type){
            case 'value-changed':
                self._window.setDocumentContent(data.content);
                self._window.setDocumentEdited(data.edited);
                self._window.syncPreview();
                break;
        }
    });
}

EditorViewController.prototype = Object.create(ViewController.prototype);
EditorViewController.prototype.constructor = EditorViewController;

EditorViewController.prototype.toggleEditorGutter = function(){
    this._view.toggleEditorGutter();
};

EditorViewController.prototype.syncEditorDocumentContent = function(){
    this._view.setEditorValue(this._window.getDocumentCopyContent());
};

EditorViewController.prototype.updateEditorFromSettings = function(){
    this._view.updateFromSettings();
};

EditorViewController.prototype.increaseEditorFontSize = function(){
    this._view.increaseFontSize();
};

EditorViewController.prototype.decreaseEditorFontSize = function(){
    this._view.decreaseFontSize();
};

EditorViewController.prototype.resetEditorFontSize = function(){
    this._view.resetFontSize();
};


EditorViewController.prototype.focusEditor = function(){
    this._view.focusEditor();
};

module.exports = EditorViewController;