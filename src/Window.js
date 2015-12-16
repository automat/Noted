const BrowserWindow = require('browser-window');
const EventEmitter  = require('events').EventEmitter;

const menu = require('./Menu');

var windowFocused = null;

function Window(controller,url,options){
    EventEmitter.call(this);
    options.frame = false;
    options.show  = false;

    this._controller = controller;
    this._url = url;
    this._window = new BrowserWindow(options);

    //BrowserWindow.getFocusedWindow() is null on 'focus'
    //cant get focused window on app switch
    var self = this;
    this._window.on('focus',function(){
        windowFocused = self;
    });

    this._window.openDevTools();
}

Window.prototype = Object.create(EventEmitter.prototype);
Window.prototype.constructor = Window;

Window.prototype.sendAction = function(type,data){
    var webContents = this._window.webContents;
    var obj = {type:type,data:data};

    if(this._ready){
        webContents.send('action',obj);
    } else {
        webContents.once('window-ready',function(){
            webContents.send('action',obj);
        });
    }
};

Window.prototype.sendResponse = function(type,data){
    this.emit('response',type,data);
};

Window.prototype.open = function(){
    var self = this;
    this._window.webContents.once('window-ready',function(){
        self._ready = true;
        self._window.show();
        self.emit('window-ready');
    });
    this._window.loadURL(this._url);
};

Window.prototype.shouldClose = function(){
    this.close();
};

Window.prototype.close = function(){
    if(windowFocused === this){
        windowFocused = null;
    }
    this._window.close();
};

Window.prototype.focus = function(){
    this._window.focus();
};

Window.prototype.blur = function(){
    this._window.blur();
};

Window.prototype.maximize = function(){
    this._window.maximize();
};

Window.prototype.minimize = function(){
    this._window.minimize();
};

Window.prototype.isMaximized = function(){
    return this._window.isMaximized();
};

Window.prototype.isCurrent = function(){
    return windowFocused === this;
};


module.exports = Window;