var EventEmitter = require('events').EventEmitter;

function View(controller){
    EventEmitter.call(this);

    this._controller = controller;
    this._element = null;

    this._elementSizePrev = [-1,-1];
    this._windowSizePrev  = [-1,-1];
}

View.prototype = Object.create(EventEmitter.prototype);
View.prototype.constructor = View;

View.prototype.initResizeHandler = function(){
    var self = this;
    window.addEventListener('resize', function(){

        var windowSize  = [window.innerWidth,window.innerHeight];
        if(windowSize[0] === self._windowSizePrev[0] && windowSize[1] === self._windowSizePrev[1]){
            return;
        }

        self._windowSizePrev[0] = windowSize[0];
        self._windowSizePrev[1] = windowSize[1];

        var elementSize = [self._element.offsetWidth,self._element.offsetHeight];
        if(elementSize[0] === self._elementSizePrev[0] && elementSize[1] === self._elementSizePrev[1]){
            return;
        }

        self._elementSizePrev[0] = elementSize[0];
        self._elementSizePrev[1] = elementSize[1];

        self.emit('view-resize');
    });
};

View.prototype.load = function(){
    this.initResizeHandler();
};

View.prototype.getElement = function(){
    return this._element;
};


View.prototype.setWidth = function(width){
    this._element.style.width = width + 'px';
    if(this._element.offsetWidth === this._elementSizePrev[0]){
        return;
    }
    this.emit('view-resize');
    this._elementSizePrev[0] = this._element.offsetWidth;
};

View.prototype.setWidthPercentage = function(percentage){
    this._element.style.width = percentage + '%';
    if(this._element.offsetWidth === this._elementSizePrev[0]){
        return;
    }
    this.emit('view-resize');
    this._elementSizePrev[0] = this._element.offsetWidth;
};

View.prototype.setHeight = function(height){
    this._element.style.height = height + 'px';
    if(this._element.offsetHeight === this._elementSizePrev[1]){
        return;
    }
    this.emit('view-resize');
    this._elementSizePrev[1] = this._element.offsetHeight;
};

View.prototype.setHeightPercentage = function(percentage){
    this._element.style.width = percentage + '%';
    if(this._element.offsetHeight === this._elementSizePrev[1]){
        return;
    }
    this.emit('view-resize');
    this._elementSizePrev[1] = this._element.offsetHeight;
};

View.prototype.setSize = function(width,height){
    this._element.style.width = width + 'px';
    this._element.style.width = height + 'px';

    var elementSize = [this._element.offsetWidth,this._element.offsetHeight];
    if(elementSize[0] === this._elementSizePrev[0] && elementSize[1] === this._elementSizePrev[1]){
        return;
    }
    this.emit('view-resize');
    this._elementSizePrev[0] = elementSize[0];
    this._elementSizePrev[1] = elementSize[1];
};


View.prototype.setSizePercentage = function(widthPercentage,heightPercentage){
    this._element.style.width = widthPercentage + '%';
    this._element.style.width = heightPercentage + '%';

    var elementSize = [this._element.offsetWidth,this._element.offsetHeight];
    if(elementSize[0] === this._elementSizePrev[0] && elementSize[1] === this._elementSizePrev[1]){
        return;
    }
    this.emit('view-resize');
    this._elementSizePrev[0] = elementSize[0];
    this._elementSizePrev[1] = elementSize[1];
};

View.prototype._updateElementSizePrevAndEmitResize = function(){
    this._elementSizePrev[0] = this._element.offsetWidth;
    this._elementSizePrev[1] = this._element.offsetHeight;
    this.emit('view-resize');
};

View.prototype.expand = function(){
    this._element.setAttribute('class','view-expand');
    this._updateElementSizePrevAndEmitResize();
};

View.prototype.show = function(){
    this._element.removeAttribute('class');
    this._updateElementSizePrevAndEmitResize();
};

View.prototype.hide = function(){
    this._element.setAttribute('class','hide');
    this._updateElementSizePrevAndEmitResize();
};

View.prototype.sendResponse = function(type,data){
    this.emit('response',type,data);
};


module.exports = View;