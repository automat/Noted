const path   = require('path');
const remote = require('remote');

const noted      = remote.getGlobal('noted');
const View       = require('./View');
const MarkdownIt = require('markdown-it');

const PreviewConsole = require('./PreviewConsole');
const Transform      = require('./MarkdownTransform');

const ViewSplitHandle     = require('./ViewSplitHandle');
const ViewSplitHandleMode = require('./ViewSplitHandleMode');

const STYLE_DIR = path.resolve(__dirname,'..','resources','style','components');
const THEME_DIR = path.resolve(__dirname,'..','resources','themes-renderer');
const TAGS_TO_BE_COUNTED = ['h1','h2','h3','h4','h5','h6','a','p','th','td','li'];

const CONSOLE_FOOTER_HEIGHT = 38;

const ViewMode = {
    PREVIEW : 'view-mode-preview',
    CONSOLE : 'view-mode-console',
    SPLIT   : 'view-mode-split'
};

function toAbsSrc(dir,nodes){
    for(var i = 0, l = nodes.length, node; i < l; ++i){
        node = nodes[i];

        var src = node.src;

        var isFile = node.src.indexOf("file://") !== -1;
        if(!isFile){
            continue;
        }

        var basedir = path.dirname(node.baseURI.substring(7));
        src = src.substring(7);

        if(src.indexOf(basedir)){
            continue;
        }

        src = '.' + src.substring(basedir.length);
        node.src = path.join(dir,src);
    }
}

function PreviewView(controller){
    View.call(this,controller);

    this._element         = null;
    this._iframe          = null;
    this._iframeWrap      = null;
    //this._viewSplitHandle = null;

    this._elementHeightPrev = -1;
    this._viewMode = ViewMode.PREVIEW;

    this._iframe_style   = null;
    this._iframe_content = null;

    this._console = new PreviewConsole();
    this._consoleDocked = false;

    this._autocompileTransfoms = true;

    this._markdownIt = new MarkdownIt({
        html : true, linkify : true
    });

    this._context = {
        window : null,
        root : null
    };

    this._input  = null;
    this._inputDirectory = null;
    this._inputTransform = true;

    this._output = null;
    this._outputWordCount = -1;

    var self = this;
    function rerender(){
        self.render(self._inputDirectory,self._input,self._inputTransform);
    }

    this._console.on('auto-comp-change',function(state){
        self._autocompileTransfoms = state;
        if(self._autocompileTransfoms){
            rerender();
        }
    });
    this._console.on('reload',rerender)

}

PreviewView.prototype = Object.create(View.prototype);
PreviewView.prototype.constructor = PreviewView;

PreviewView.prototype.load = function(){
    this._element         = document.getElementById('preview-view');
    this._iframe          = document.getElementById('preview-view-iframe');
    this._iframeWrap      = document.getElementById('preview-view-wrapper');
    //this._viewSplitHandle = new ViewSplitHandle(
    //    document.getElementById('preview-split-handle'),
    //    ViewSplitHandleMode.HORIZONTAL
    //);

    var self = this;
    var iframe_document = this._iframe.contentWindow.document;

    var html_iframe =
        '<head>\n' +
            '<style></style>\n' +
            '<style>\n' +
            '   @import "' + STYLE_DIR + '/preview-iframe.css"</style>\n' +
            '</style>\n' +
        '</head>\n' +
        '<body>\n' +
        '</body>';

    iframe_document.open();
    iframe_document.write(html_iframe);
    iframe_document.close();

    this._iframe_style   = iframe_document.getElementsByTagName('head')[0].getElementsByTagName('style')[0];
    this._iframe_content = iframe_document.body;

    this._console.load();
    this._console.show();

    var window_ = this._context.window = this._iframe.contentWindow;

    window_.__logSetOffset = function(){
        self._console.setOffset.call(self._console,arguments);
    };

    window_.__logReset = function(){
        self._console.logReset();
    };

    window_.__logStatic = function(){
        self._console.logStatic.apply(self._console,arguments);
    };

    window_.__logPopulate = function(){
        self._console.logPopulate();
        if(self._console.getNumMessages() === 0){
            self._console.collapse();
        } else {
            self._console.expand();
        }
    };

    //this._viewSplitHandle.on('mode-change',function(position){
    //    if(self._consoleDocked){
    //        return;
    //    }
    //    self.dockConsoleLog();
    //});
    //
    //this._viewSplitHandle.on('mousedown',function(e){
    //    self._consoleDocked = false;
    //});
    //
    //this._viewSplitHandle.on('mouseup',function(e){
    //    self._consoleDocked = (self._element.offsetHeight - self._viewSplitHandle.getPosition()) === CONSOLE_FOOTER_HEIGHT;
    //});
    //
    //var offsetTop = self._element.getBoundingClientRect().top;
    //
    function onMouseMove(e){
        //if(!self._viewSplitHandle.isDragging()){
        //    return;
        //}
        //var offset = e.y + (this === window_ ?  0 : -offsetTop);
        //    offset = Math.max(0, Math.min(offset,self._element.offsetHeight - CONSOLE_FOOTER_HEIGHT));
        //self._viewSplitHandle.setPosition(offset);
        //self.updateViewRatio();
    }

    window.addEventListener('mousemove',onMouseMove);
    window_.addEventListener('mousemove',onMouseMove);

    this._elementHeightPrev = this._element.offsetHeight;
    window.addEventListener('resize',function(){
        self.updateHandleRatioSize();
        self.updateViewRatio();
        self._elementHeightPrev = self._element.offsetHeight;
    });

    this.updateFromSettings();
};

PreviewView.prototype.updateFromSettings = function(){
    var settings = noted.settings.preview;
    this._iframe_style.innerHTML = '@import "' + THEME_DIR + '/' + settings.theme + '.css"';
};

PreviewView.prototype.render = function(directory, markdown, transform){
    transform = transform === undefined ? true : transform;

    this._input          = markdown;
    this._inputDirectory = directory;
    this._inputTransform = transform;

    this._iframe_content.innerHTML = this._markdownIt.render(markdown);

    var tags = ['img','video','audio'];
    for(var i = 0, l = tags.length; i < l; ++i){
        toAbsSrc(directory, this._iframe_content.getElementsByTagName(tags[i]));
    }

    var filteredNodes = Transform.filterTransformNodes(this._context.window);

    if(filteredNodes.all.length !== 0){
        //this.showConsole();

        if(this._autocompileTransfoms && transform){
            Transform.transformFilteredNodes(filteredNodes);
        } else {
            //this._console.collapse();
            //this.dockConsoleLog();
        }

    } else {
        //this.hideConsole();
    }

    this._output = this._iframe_content.outerHTML;
    this._outputWordCount = 0;

    for(var i = 0, l = TAGS_TO_BE_COUNTED.length; i < l; ++i){
        var nodes = this._iframe_content.getElementsByTagName(TAGS_TO_BE_COUNTED[i]);
        for(var j = 0, k = nodes.length; j < k; ++j){
            this._outputWordCount += nodes[j].textContent === '' ? 0 : nodes[j].textContent.split(' ').length;
        }
    }
};

PreviewView.prototype.updateViewRatio = function(){
 //   var elementHeight = this._element.offsetHeight;
    //if(this._consoleDocked){
    //    this._iframeWrap.style.bottom = (CONSOLE_FOOTER_HEIGHT) + 'px';
    //    this._console.setHeight(CONSOLE_FOOTER_HEIGHT);
    //    return;
    //}
    //var height = elementHeight - this._viewSplitHandle.getPosition();
    //this._iframeWrap.style.bottom = height + 'px';
    //this._console.setHeight(height);
};

PreviewView.prototype.updateHandleRatioSize = function(){
    //var elementHeight = this._element.offsetHeight;
    ////if(this._consoleDocked){
    ////    this._viewSplitHandle.setPosition(elementHeight-CONSOLE_FOOTER_HEIGHT);
    ////    return;
    ////}
    //var position      = this._viewSplitHandle.getPosition();
    //
    //if(position === elementHeight * 0.5){
    //    return;
    //}
    //
    //position = position / this._elementHeightPrev * elementHeight;
    //position = Math.max(0, Math.min(position,elementHeight - CONSOLE_FOOTER_HEIGHT));
    //this._viewSplitHandle.setPosition(position);
};

PreviewView.prototype.showConsole = function(){
    //this._console.show();
    //this.dockConsoleLog();
};

PreviewView.prototype.hideConsole = function(){
    //this._console.hide();
    //this.dockConsoleLog();
};

PreviewView.prototype.dockConsoleLog = function(){
    if(this._consoleDocked){
        return;
    }
    this._consoleDocked = true;
    this.updateViewRatio();
    this.updateHandleRatioSize();
};

PreviewView.prototype.setViewMode = function(mode){

    this._viewModePrev = this._viewMode;

    //switch(mode){
    //    case ViewMode.CONSOLE:
    //        this._console.expand();
    //        break;
    //
    //    case ViewMode.PREVIEW:
    //        this._editorViewController.hideView();
    //        this._previewViewController.expandView();
    //        this._viewSplitHandle.hide();
    //        break;
    //
    //    case ViewMode.SPLIT:
    //        this._editorViewController.showView();
    //        this._previewViewController.showView();
    //        this._viewSplitHandle.show();
    //        this._editorViewController.focusEditor();
    //        break;
    //}

    this._viewMode = mode;
};

PreviewView.prototype.getOutput = function(){
    return this._output;
};

PreviewView.prototype.getOutputWordCount = function(){
    return this._outputWordCount;
};

PreviewView.prototype.getIframeWindow = function(){
    return this._iframe.contentWindow.window;
};

module.exports = PreviewView;