const fs   = require('fs');
const path = require('path');

const View   = require('./View');
const remote = require('remote');
const noted  = remote.getGlobal('noted');

const MarkdownSnippet  = require('./MarkdownSnippet');
const EditSessionPatch = require('./EditSessionPatch');

const MIN_FONT_SIZE = 6;
const MAX_FONT_SIZE = 48;
const STYLE_DIR     = path.resolve(__dirname,'..','resources','themes-editor');

function getDomStringWidth(fontFamily,fontSize,str){
    var span = document.createElement('span');
    span.style.position = 'absolute';
    span.style.float = 'left';
    span.style.whiteSpace = 'nowrap';
    span.style.visibility = 'hidden';
    span.style.fontFamily = fontFamily;
    span.style.fontSize   = fontSize + 'px';
    span.textContent = str;

    document.body.appendChild(span);
    var width = span.offsetWidth;
    document.body.removeChild(span);

    return width;
}

function create_ace_editor_styleFromExternalStyle(name){
    var stylePath = path.join(STYLE_DIR,name + '.css');

    if(fs.exists(stylePath)){
        throw new Error('Style does not exist: ' + name + '.');
    }

    var str     = fs.readFileSync(stylePath,'utf8');
    var acePath = "ace/theme/" + name;

    define(
        acePath,
        ["require","exports","module","ace/lib/dom"],
        function(e,t,n){
            t.isDark   = !0;
            t.cssClass = name;
            t.cssText  = str;
            var r = e("../lib/dom");
            r.importCssString(t.cssText, t.cssClass);
        }
    );

    return acePath;
}

function ace_editor_updateFromSettings(){
    var settings = noted.settings.editor;
    var session = ace_editor.getSession();

    session.setUseWrapMode(settings.word_wrap);
    session.setWrapLimitRange(0, settings.word_wrap_limit);

    ace_editor.setOptions({
        fontFamily : settings.font_family,
        fontSize : settings.font_size
    });

    ace_editor.container.style.lineHeight = settings.line_height;

    ace_editor.renderer.setShowGutter(settings.show_gutter);
    ace_editor.renderer.setPadding(settings.padding);
    ace_editor.renderer.setScrollMargin(settings.padding, settings.padding);

    ace_editor.setTheme(create_ace_editor_styleFromExternalStyle(settings.theme));
}

global.ace_editor_updateFromSettings = ace_editor_updateFromSettings;

function EditorView(controller){
    View.call(this,controller);

    this._ace_editor = null;
    this._ace_editor_element = null;
    this._ace_editor_settings = {
        fontFamily : '',
        fontSizeInitial : -1,
        fontSize : -1,
        showGutter : false,
        padding : -1,
        wordWarpLimit : -1
    };
    this._ace_editor_inputAreaMaxWidth = -1;

    this._editorValueStoredEdited = false;
    this._editorValueStored  = null;

    this._documentLoaded = false;

    this._scroll = {min:-1,max:-1,top:-1};
}

EditorView.prototype = Object.create(View.prototype);
EditorView.prototype.constructor = EditorView;

EditorView.prototype.load = function(){
    this.initResizeHandler();

    this._element            = document.getElementById('editor-view');
    this._ace_editor         = ace_editor;
    this._ace_editor_element = document.getElementById('ace-editor');

    var self = this;

    this._element.addEventListener('dragover',function(e){
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    });

    this._element.addEventListener('drop',function(e){
        e.stopPropagation();
        e.preventDefault();

        var files = e.dataTransfer.files;
        for(var i = 0, l = files.length; i < l; ++i){
            var snippet = MarkdownSnippet.get(files[i].path);
            if(snippet === null){
                continue;
            }
            self._ace_editor.insert(snippet + '\n');
        }
    });

    var session  = this._ace_editor.getSession();
    var renderer = this._ace_editor.renderer;

    session.on('changeScrollTop',function(scroll){
        //self._scrollTop = Math.max(self._scrollTopMin,Math.min(scroll,self._scrollTopMax));
    });

    renderer.on('afterRender',function(){
        //self._scrollTopMin = -renderer.scrollMargin.top;
        //self._scrollTopMax =  renderer.layerConfig.maxHeight - renderer.$size.scrollerHeight + renderer.scrollMargin.bottom;
    });

    this._ace_editor.on('input',function(){
        if(!self._documentLoaded){
            self._documentLoaded = true;
            return;
        }

        var value  = self.getEditorValue();
        var edited = self._editorValueStoredEdited = value !== self._editorValueStored;

        self.sendResponse('value-changed',{content:value,edited:edited});
    });

    this.on('view-resize',function(){
        var minPadding = (self._ace_editor_element.offsetWidth - self._ace_editor_inputAreaMaxWidth) * 0.5;
        self._ace_editor.renderer.setPadding(Math.max(self._ace_editor_settings.padding,minPadding));
        self._ace_editor.resize();
    });

    this._ace_editor_settings.showGutter = noted.settings.show_gutter;

    this.updateFromSettings();
    this._ace_editor.focus();
};

EditorView.prototype.setEditorValue = function(value){
    this._editorValueStored = value;
    this._ace_editor.getSession().setValue(value);
};

EditorView.prototype.getEditorValue = function(){
    return this._ace_editor.getSession().getValue();
};

EditorView.prototype.isEditorValueStoredEdited = function(){
    return this._editorValueStoredEdited;
};

EditorView.prototype.storeEditorValue = function(){
    this._editorValueStored = this.getEditorValue();
    this._editorValueStoredEdited = false;
};

EditorView.prototype.updateFromSettings = function(){
    var settings            = noted.settings.editor;
    var ace_editor_settings = this._ace_editor_settings;

    ace_editor_settings.fontFamily    = settings.font_family;
    ace_editor_settings.fontSize      = ace_editor_settings.fontSizeInitial = settings.font_size;
    ace_editor_settings.wordWrapLimit = settings.word_wrap_limit;
    ace_editor_settings.padding       = settings.padding;

    ace_editor_updateFromSettings();
    this._update_ace_editor_inputAreaMaxWidth();
};

EditorView.prototype.focusEditor = function(){
    this._ace_editor.focus();
};

EditorView.prototype.toggleEditorGutter = function(){
    this._ace_editor_settings.showGutter = !this._ace_editor_settings.showGutter;
    this._ace_editor.renderer.setShowGutter(this._ace_editor_settings.showGutter);
};

EditorView.prototype._update_ace_editor_inputAreaMaxWidth = function(){
    var xcharWidth = getDomStringWidth(this._ace_editor_settings.fontFamily,this._ace_editor_settings.fontSize,'X') - 0.5;
    this._ace_editor_inputAreaMaxWidth = xcharWidth * this._ace_editor_settings.wordWrapLimit;
};

EditorView.prototype._update_ace_editor_inputAreaFromFontSize = function(){
    this._ace_editor.setFontSize(this._ace_editor_settings.fontSize);
    this._update_ace_editor_inputAreaMaxWidth();
    this._update_ace_editor_padding();
};

EditorView.prototype._update_ace_editor_padding = function(){
    var minPadding = (this._ace_editor_element.offsetWidth - this._ace_editor_inputAreaMaxWidth) * 0.5;
    this._ace_editor.renderer.setPadding(Math.max(this._ace_editor_settings.padding,minPadding));
    this._ace_editor.resize();
};

EditorView.prototype.increaseFontSize = function(){
    this._ace_editor_settings.fontSize = Math.min(this._ace_editor_settings.fontSize+1,MAX_FONT_SIZE);
    this._update_ace_editor_inputAreaFromFontSize();
};

EditorView.prototype.decreaseFontSize = function(){
    this._ace_editor_settings.fontSize = Math.max(this._ace_editor_settings.fontSize-1,MIN_FONT_SIZE);
    this._update_ace_editor_inputAreaFromFontSize();
};

EditorView.prototype.resetFontSize = function(){
    this._ace_editor_settings.fontSize = this._ace_editor_settings.fontSizeInitial;
    this._update_ace_editor_inputAreaFromFontSize();
};

module.exports = EditorView;