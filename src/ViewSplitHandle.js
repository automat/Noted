var EventEmitter = require('events').EventEmitter;
var Mode         = require('./ViewSplitHandleMode');

function ViewSplitHandle(element,mode){
    mode = mode === undefined ? Mode.VERTICAL : mode;

    EventEmitter.call(this);

    this._mode     = mode;
    this._dragging = false;

    var self = this;

    this._element = element;

    this._element.addEventListener('mousedown',function(e){
        self._dragging = true;
        self.emit('mousedown',e);
    });

    this._element.addEventListener('mouseover',function(){
        self._element.style.cursor = self._mode === Mode.VERTICAL ? 'col-resize' : 'row-resize';
    });

    function onMouseUp(e){
        if(!self._dragging){
            return;
        }
        self._dragging = false;
        self.emit('mouseup',e);
    }

    this._element.addEventListener('mouseup',onMouseUp);

    document.addEventListener('mouseup',onMouseUp);

    this._element.addEventListener('dblclick',function(){
        self.emit('mode-change',self._element.style[self._mode === Mode.VERTICAL ? 'left' : 'top']);
    });

    document.addEventListener('mouseleave',function(){
        self._dragging = false;
    });
}

ViewSplitHandle.prototype = Object.create(EventEmitter.prototype);
ViewSplitHandle.prototype.constructor = ViewSplitHandle;

ViewSplitHandle.prototype.isDragging = function(){
    return this._dragging;
};

ViewSplitHandle.prototype.setPosition = function(position){
    this._element.style[ this._mode === Mode.VERTICAL ? 'left' : 'top'] = position + 'px';
};

ViewSplitHandle.prototype.getPosition = function(){
    var position;
    switch(this._mode){
        case Mode.VERTICAL:
            var left = this._element.style.left;
            position =  (left === '50%' || left === '') ?
                window.innerWidth * 0.5 :
                parseFloat(left);
            break;

        case Mode.HORIZONTAL:
            var top = this._element.style.top;
            position =  (top === '50%' || top === '') ?
                window.innerHeight * 0.5 :
                parseFloat(top);
            break;
    }
    return position;
};

ViewSplitHandle.prototype.show = function(){
    this._element.removeAttribute('class');
};

ViewSplitHandle.prototype.hide = function(){
    this._element.setAttribute('class','hide');
};

module.exports = ViewSplitHandle;
