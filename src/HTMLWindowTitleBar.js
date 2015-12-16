const EventEmitter = require('events').EventEmitter;

function HTMLWindowTitleBar(options){
    options                    = options || {};
    options.editable           = options.editable           === undefined ? false : options.editable;
    options.btnCloseEnabled    = options.btnCloseEnabled    === undefined ? true  : options.btnCloseEnabled;
    options.btnMinimizeEnabled = options.btnMinimizeEnabled === undefined ? true  : options.btnMinimizeEnabled;
    options.btnFullEnabled     = options.btnFullEnabled     === undefined ? true  : options.btnFullEnabled;

    EventEmitter.call(this);

    this._editable    = options.editable;
    this._editing     = false;
    this._namePreEdit = '';

    var input = this._input = document.createElement('span');
        input.setAttribute('contenteditable', options.editable);
        input.setAttribute('id','title-bar-input');

    var inputWrap = document.createElement('div');
        inputWrap.setAttribute('id','title-bar-input-wrap');
        inputWrap.appendChild(input);

    var wordCounter = this._wordCounter = document.createElement('div');
        wordCounter.setAttribute('id','title-bar-word-counter');
        wordCounter.setAttribute('class','hide');

    this._element = document.getElementById('title-bar');
    this._element.appendChild(inputWrap);
    this._element.appendChild(wordCounter);

    var self = this;

    if(this._editable){
        input.addEventListener('focus',function(){
            if(!self._editing){
                self._editing = true;
                self._namePreEdit = this.textContent;
            }
        });

        input.addEventListener('keydown',function(e){
            if(e.keyCode !== 13){
                return;
            }

            if(this.textContent === ''){
                this.textContent = self._namePreEdit;
            }

            self._editing = false;
            e.preventDefault();
            this.blur();

            self.emit(EditorEvent.DOCUMENT_NAME_CHANGE,this.textContent);
        });

        input.addEventListener('keyup',function(e){
            if(self._editing || e.keyCode === 13){
                e.preventDefault();
                return;
            }
        });

        input.addEventListener('blur',function(){
            if(!self._editing){
                return;
            }
            this.textContent = self._namePreEdit;
            self._editing = false;
        });
    }

    this._btnCloseEnabled    = options.btnCloseEnabled;
    this._btnMinimizeEnabled = options.btnMinimizeEnabled;
    this._btnFullEnabled     = options.btnFullEnabled;

    var menuBtnClose    = this._btnClose    = document.getElementById('title-bar-menu-close');
    var menuBtnMinimize = this._btnMinimize = document.getElementById('title-bar-menu-minimize');
    var menuBtnFull     = this._btnFull     = document.getElementById('title-bar-menu-full');

    if(options.btnCloseEnabled){
        menuBtnClose.addEventListener('mousedown',function(){
            if(menuBtnClose.getAttribute('class') === 'blur'){
                return;
            }
            self.emit('close',null);
        });
    } else {
        menuBtnClose.setAttribute('class','blur');
    }

    if(options.btnMinimizeEnabled){
        menuBtnMinimize.addEventListener('mousedown',function(){
            if(menuBtnMinimize.getAttribute('class') === 'blur'){
                return;
            }
            self.emit('minimize',null);
        });
    } else {
        menuBtnMinimize.setAttribute('class','blur');
    }

    if(options.btnFullEnabled){
        menuBtnFull.addEventListener('mousedown',function(){
            if(menuBtnFull.getAttribute('class') === 'blur'){
                return;
            }
            self.emit('full',null);
        });
    } else {
        menuBtnFull.setAttribute('class','blur');
    }
}

HTMLWindowTitleBar.prototype = Object.create(EventEmitter.prototype);
HTMLWindowTitleBar.prototype.constructor = HTMLWindowTitleBar;

HTMLWindowTitleBar.prototype.resetDocumentName = function(){
    this._input.textContent = this._namePreEdit;
};

HTMLWindowTitleBar.prototype.setDocumentName = function(name){
    this._input.textContent = this._namePreEdit = name;
};

HTMLWindowTitleBar.prototype.setDocumentEdited = function(enable){
    enable ? this._input.setAttribute('class','edited') : this._input.removeAttribute('class');
};

HTMLWindowTitleBar.prototype.focus = function(){
    this._element.removeAttribute('class');
    this._element.focus();
};

HTMLWindowTitleBar.prototype.blur = function(){
    this._element.setAttribute('class','blur');
};

HTMLWindowTitleBar.prototype.show = function(){
    this._element.removeAttribute('class');
};

HTMLWindowTitleBar.prototype.hide = function(){
    this._element.setAttribute('class','hide');
};

HTMLWindowTitleBar.prototype.setBtnCloseEnable = function(enable){
    if(!this._btnCloseEnabled){
        return;
    }
    this._btnClose.setAttribute('class',enable ? null : 'blur');
};

HTMLWindowTitleBar.prototype.setBtnMinimizeEnable = function(enable){
    if(!this._btnMinimizeEnabled){
        return;
    }
    this._btnMinimize.setAttribute('class',enable ? null : 'blur');
};

HTMLWindowTitleBar.prototype.setBtnFullEnable = function(enable){
    if(!this._btnFullEnabled){
        return;
    }
    this._btnFull.setAttribute('class',enable ? null : 'blur');
};

HTMLWindowTitleBar.prototype.setWordCount = function(count){
    if(count !== 0){
        this._wordCounter.removeAttribute('class');
    } else {
        this._wordCounter.setAttribute('class','hide');
    }
    this._wordCounter.textContent = count;
};

module.exports = HTMLWindowTitleBar;