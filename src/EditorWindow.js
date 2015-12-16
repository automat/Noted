const BrowserWindow = require('browser-window');

const Window        = require('./Window');
const WindowAction  = require('./WindowAction');
const EditorResonse = require('./EditorResponse');

var menu = require('./Menu');

const DEFAULT_WIDTH  = 1280;
const DEFAULT_HEIGHT = 960;
const MIN_WIDTH = 500;
const MIN_HEIGHT = 600;

var editorIds = [];

function EditorWindow(controller){
    Window.call(this,
        controller,
        'file://' + __dirname + '/../html/Editor.html',{
        width:  DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        minWidth : MIN_WIDTH,
        minHeight : MIN_HEIGHT
    });

    editorIds.push(this._window.id);

    var self = this;
    this._window.webContents.on('response',function(data){
        var type = data.type;
            data = data.data;

        switch(type){
            case EditorResonse.DOCUMENT_SYNC_FOR_CLOSE:
                self.sendResponse(EditorResonse.DOCUMENT_SYNC_FOR_CLOSE,data);
                break;
            case EditorResonse.DOCUMENT_SYNC_FOR_DUPLICATE:
                self.sendResponse(EditorResonse.DOCUMENT_SYNC_FOR_DUPLICATE,data);
                break;
            case EditorResonse.DOCUMENT_SYNC_FOR_SAVE:
                self.sendResponse(EditorResonse.DOCUMENT_SYNC_FOR_SAVE,data);
                return;
        }
    });

    this._window.on('focus',function(){
        var document = self._controller.getDocument();
        menu.enableDocumentMenu(true,document.getModelPath() === null || document.isDocumentEdited());
        menu.enableWindowViewMenu(true);
    });

    this._window.on('blur',function(){
        menu.enableDocumentMenu(false);
        menu.enableWindowViewMenu(false);
    });

    this._shouldClose = false;
}

EditorWindow.prototype             = Object.create(Window.prototype);
EditorWindow.prototype.constructor = EditorWindow;

EditorWindow.isEditorWindow = function(browserWindow){
    return editorIds.indexOf(browserWindow.id) !== -1;
};

function focusedEditorSendMenuAction(action){
    var window = BrowserWindow.getFocusedWindow();
    if(window === null || editorIds.indexOf(window.id) === -1){
        return;
    }
    window.webContents.send('menu-action',action);
}

menu.viewToggleEditor.click = function(){
    focusedEditorSendMenuAction('toggle-editor');
};

menu.viewToggleGutter.click = function(){
    focusedEditorSendMenuAction('toggle-gutter');
};

menu.viewTogglePreview.click = function(){
    focusedEditorSendMenuAction('toggle-preview');
};

menu.viewTogglePresentation.click = function(){
    focusedEditorSendMenuAction('toggle-presentation');
};

menu.viewToggleFullscreen.click = function(){
    focusedEditorSendMenuAction('toggle-fullScreen');
};

menu.viewResetFontSize.click = function(){
    focusedEditorSendMenuAction('reset-font-size');
};

menu.viewIncreaseFontSize.click = function(){
    focusedEditorSendMenuAction('increase-font-size');
};

menu.viewDecreaseFontSize.click = function(){
    focusedEditorSendMenuAction('decrease-font-size');
};


module.exports = EditorWindow;