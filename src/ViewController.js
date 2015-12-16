function ViewController(window,view){
    this._window = window;
    this._view   = view;
}

ViewController.prototype.loadView = function(){
    this._view.load();
};

ViewController.prototype.getWindow = function(){
    return this._window;
};

ViewController.prototype.getView = function(){
    return this._view;
};

ViewController.prototype.expandView = function(){
    this._view.expand();
};

ViewController.prototype.showView = function(){
    this._view.show();
};

ViewController.prototype.hideView = function(){
    this._view.hide()
};

module.exports = ViewController;