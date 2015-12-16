const ViewController = require('./ViewController');
const PreviewView    = require('./PreviewView');

function PreviewViewController(htmlWindow){
    ViewController.call(this,htmlWindow,new PreviewView(this));
}

PreviewViewController.prototype = Object.create(ViewController.prototype);
PreviewViewController.prototype.constructor = PreviewViewController;

PreviewViewController.prototype.syncPreviewDocument = function(){
    this._view.render(this._window.getDocumentCopyDirectory(),this._window.getDocumentCopyContent());
    this._window.getTitleBar().setWordCount(this._view.getOutputWordCount());
};

module.exports = PreviewViewController;