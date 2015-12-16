const path = require('path');

const remote        = require('remote');
const ipc           = require('ipc-renderer');

const dir = path.resolve(__dirname,'../src/') + '/';

const HTMLWindow = require(dir + './HTMLWindow');
const PreviewViewController = require(dir + './PreviewViewController');
const EditorViewController  = require(dir + './EditorViewController');

const ViewSplitHandleMode = require(dir + './ViewSplitHandleMode');
const ViewSplitHandle     = require(dir + './ViewSplitHandle');

const WindowAction   = require(dir + './WindowAction');
const EditorAction   = require(dir + './EditorAction');
const EditorResponse = require(dir + './EditorResponse');

const ViewMode = {
    EDITOR  : 'view-mode-editor',
    PREVIEW : 'view-mode-preview',
    SPLIT   : 'view-mode-split'
};

const MIN_VIEW_WIDTH = 50;

function HTMLEditor(){
    HTMLWindow.call(this);

    this._documentCopy = {
        name      : '',
        content   : '',
        directory : null,
        edited    : false
    };

    this._editorViewController  = new EditorViewController(this);
    this._viewSplitHandle       = null;
    this._previewViewController = new PreviewViewController(this);

    this._windowWidthPrev = -1;

    this._viewMode     = ViewMode.SPLIT;
    this._viewModePrev = null;
}

HTMLEditor.prototype = Object.create(HTMLWindow.prototype);
HTMLEditor.prototype.constructor = HTMLEditor;

HTMLEditor.prototype.setDocumentContent = function(content){
    this._documentCopy.content = content;
};

HTMLEditor.prototype.getDocumentCopyContent = function(){
    return this._documentCopy.content;
};

HTMLEditor.prototype.setDocumentCopyName = function(name){
    this._documentCopy.name = name;
};

HTMLEditor.prototype.getDocumentCopyName = function(){
    return this._documentCopy.name;
};

HTMLEditor.prototype.getDocumentCopyDirectory = function(){
    return this._documentCopy.directory;
};

HTMLEditor.prototype.load = function(){
    this.loadViewContainer();
    this.loadTitleBar({editable:true});

    var self = this;

    ipc.on('menu-action',function(event,type){
        switch(type){
            case 'toggle-editor':
                switch(self._viewMode){
                    case ViewMode.EDITOR:
                        self.setViewMode(ViewMode.SPLIT);
                        break;

                    case ViewMode.PREVIEW:
                    case ViewMode.SPLIT:
                        self.setViewMode(ViewMode.EDITOR);
                        break;
                }
                break;

            case 'toggle-gutter':
                self._editorViewController.toggleEditorGutter();
                break;

            case 'toggle-preview':
                switch(self._viewMode){
                    case ViewMode.PREVIEW:
                        self.setViewMode(ViewMode.SPLIT);
                        break;

                    case ViewMode.EDITOR:
                    case ViewMode.SPLIT:
                        self.setViewMode(ViewMode.PREVIEW);
                        break;
                }
                break;

            case 'toggle-presentation':
                var fullScreen = !self.isFullScreen();
                self.setFullScreen(fullScreen,false);
                self.setViewMode(fullScreen ? ViewMode.PREVIEW : ViewMode.SPLIT);
                break;

            case 'toggle-fullScreen':
                self.setFullScreen(!self.isFullScreen(),true);
                break;

            case 'reset-font-size':
                self._editorViewController.resetEditorFontSize();
                break;

            case 'increase-font-size':
                self._editorViewController.increaseEditorFontSize();
                break;

            case 'decrease-font-size':
                self._editorViewController.decreaseEditorFontSize();
                break;
        }
    });

    this._editorViewController.loadView();
    this._viewSplitHandle = new ViewSplitHandle(document.getElementById('editor-split-handle'),ViewSplitHandleMode.VERTICAL);
    this._previewViewController.loadView();


    this._viewSplitHandle.on('mode-change',function(position){
        var width_2 = window.innerWidth * 0.5;

        if(position === '50%' || position === width_2 || position === ''){
            self.setViewMode(ViewMode.EDITOR);
            return;
        }

        position = parseFloat(position);
        if(position === 0 || isNaN(position)){
            return;
        }

        self.setViewMode(position > width_2 ? ViewMode.EDITOR : ViewMode.PREVIEW);
    });

    var previewElement      = this._previewViewController.getView().getElement();
    var previewIframeWindow = this._previewViewController.getView().getIframeWindow();

    function onMouseMove(e){
        if(!self._viewSplitHandle.isDragging()){
            return;
        }
        var offset = e.x + (this === previewIframeWindow ? previewElement.offsetLeft : 0);
            offset = Math.max(MIN_VIEW_WIDTH, Math.min(offset, window.innerWidth - MIN_VIEW_WIDTH));

        self._viewSplitHandle.setPosition(offset);
        self.updateViewRatio();
    }

    window.addEventListener('mousemove',onMouseMove);
    previewIframeWindow.addEventListener('mousemove',onMouseMove);

    window.addEventListener('resize',function(){
        self.updateHandleRatioSize();
        self.updateViewRatio();
        self._windowWidthPrev = window.innerWidth;
    });

    //flash of unstyled content, ace editor
    setTimeout(function(){
        self.sendReady();
    },500);
};

HTMLEditor.prototype.updateViewRatio = function(){
    var ratio = this._viewSplitHandle.getPosition() / window.innerWidth * 100.0;

    this._editorViewController.getView().setWidthPercentage(ratio);
    this._previewViewController.getView().setWidthPercentage(100 - ratio);
};

HTMLEditor.prototype.updateHandleRatioSize = function(){
    var position    = this._viewSplitHandle.getPosition();
    var windowWidth = window.innerWidth;

    if(position === windowWidth * 0.5){
        return;
    }

    position = position / this._windowWidthPrev * windowWidth;
    position = Math.max(MIN_VIEW_WIDTH,Math.min(position, windowWidth - MIN_VIEW_WIDTH));

    this._viewSplitHandle.setPosition(position);
};

HTMLEditor.prototype.setViewMode = function(mode){

    this._viewModePrev = this._viewMode;

    switch(mode){
        case ViewMode.EDITOR:
            this._editorViewController.expandView();
            this._previewViewController.hideView();
            this._viewSplitHandle.hide();
            this._editorViewController.focusEditor();
            break;

        case ViewMode.PREVIEW:
            this._editorViewController.hideView();
            this._previewViewController.expandView();
            this._viewSplitHandle.hide();
            break;

        case ViewMode.SPLIT:
            this._editorViewController.showView();
            this._previewViewController.showView();
            this._viewSplitHandle.show();
            this._editorViewController.focusEditor();
            break;
    }

    this._viewMode = mode;

    if(this._viewModePrev !== ViewMode.EDITOR || this._viewMode === ViewMode.EDITOR){
        return;
    }

    this._editorViewController.syncEditorDocumentContent();
    this._previewViewController.syncPreviewDocument();
};

HTMLEditor.prototype.setDocumentEdited = function(edited){
    this._documentCopy.edited = edited;
    this._titleBar.setDocumentEdited(edited);
    this.sendResponse(EditorResponse.DOCUMENT_EDITED_STATUS,edited);
};

HTMLEditor.prototype.syncPreview = function(){
    this._previewViewController.syncPreviewDocument();
};

HTMLEditor.prototype.onAction = function(type,data){
    switch(type){
        case WindowAction.DOCUMENT_NAME_SYNC:
            this._documentCopy.name = data;
            break;

        case EditorAction.LOAD_DOCUMENT:
            this._documentCopy.content   = data.content;
            this._documentCopy.directory = data.directory;
            this._documentCopy.name      = data.name;

            this._titleBar.setDocumentName(data.name);
            this.setDocumentEdited(data.edited);

            this._editorViewController.syncEditorDocumentContent();
            if(this._viewMode !== ViewMode.EDITOR){
                this._previewViewController.syncPreviewDocument();
            }
            break;

        case EditorAction.SYNC_DOCUMENT_STATE:
            this._documentCopy.directory = data.directory;
            this._documentCopy.name      = data.name;
            this._documentCopy.edited    = data.edited;

            this._titleBar.setDocumentName(data.name);
            this.setDocumentEdited(data.edited);

            break;

        case EditorAction.SYNC_DOCUMENT_FOR_DUPLICATE:
            this.sendResponse(EditorResponse.DOCUMENT_SYNC_FOR_DUPLICATE,{
                name:    this._documentCopy.name,
                content: this._documentCopy.content,
                edited:  this._documentCopy.edited
            });
            break;

        case EditorAction.SYNC_DOCUMENT_FOR_SAVE:
            this.sendResponse(EditorResponse.DOCUMENT_SYNC_FOR_SAVE,{
                name : this._documentCopy.name,
                content : this._documentCopy.content,
                edited : this._documentCopy.edited
            });
            break;

        case WindowAction.SHOULD_CLOSE:
            this.sendResponse(EditorResponse.DOCUMENT_SYNC_FOR_CLOSE,{
                name:    this._documentCopy.name,
                content: this._documentCopy.content,
                edited:  this._documentCopy.edited
            });
            break;
    }
};

module.exports = HTMLEditor;
