const remote        = require('remote');
const ipc           = require('ipc-renderer');
const BrowserWindow = remote.BrowserWindow;

const HTMLWindowTitleBar = require('./HTMLWindowTitleBar');
const WindowAction = require('./WindowAction');


function HTMLWindow(){
    this._titleBar = null;
    this._elementViewContainer = null;

    var self = this;
    ipc.on('action',function(event,data){
         var type = data.type;
             data = data.data;

        switch(type){
            case WindowAction.DOCUMENT_NAME_SYNC:
                self._titleBar.setDocumentName(data);
                self.onAction(type,data);
                break;

            default:
                self.onAction(type,data);
                break;
        }
    });
}

HTMLWindow.prototype.loadViewContainer = function(){
    this._elementViewContainer = document.getElementById('view-container');
};

HTMLWindow.prototype.loadTitleBar = function(options){
    this._titleBar = new HTMLWindowTitleBar(options);

    var self = this;
    this._titleBar.on('close',function(){
        self.onAction(WindowAction.SHOULD_CLOSE,null);
    });

    this._titleBar.on('minimize',function(){
        remote.getCurrentWindow().minimize();
    });

    this._titleBar.on('full',function(){
        self.setFullScreen(!self.isFullScreen(),true);
    });
};

HTMLWindow.prototype.getTitleBar = function(){
    return this._titleBar;
};

HTMLWindow.prototype.setFullScreen = function(fullScreen,showTitleBar){
    showTitleBar = showTitleBar === undefined ? false : showTitleBar;

    var window_ = remote.getCurrentWindow();

    if(!fullScreen){
        this._elementViewContainer.removeAttribute('class');
        window_.setFullScreen(false);

        this._titleBar.show();
        this._titleBar.setBtnMinimizeEnable(true);
        this._elementViewContainer.removeAttribute('class');

    } else {
        if(showTitleBar){
            this._titleBar.setBtnMinimizeEnable(false);
        } else {
            this._titleBar.hide();
            this._elementViewContainer.setAttribute('class','view-container-expand');
        }
        window_.setFullScreen(true);
    }
};

HTMLWindow.prototype.isFullScreen = function(){
    return remote.getCurrentWindow().isFullScreen();
};

HTMLWindow.prototype.load = function(){};

HTMLWindow.prototype.sendReady = function(){
    remote.getCurrentWebContents().emit('window-ready');
};

HTMLWindow.prototype.sendResponse = function(type,data){
    remote.getCurrentWebContents().emit('response',{type:type,data:data});
};

HTMLWindow.prototype.onAction = function(type,data){};

HTMLWindow.prototype.isCurrentWindow = function(){
    return BrowserWindow.getFocusedWindow().id === remote.getCurrentWindow().id;
};

module.exports = HTMLWindow;