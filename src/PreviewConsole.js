const View = require('./View');

const DEFAULT_MSG_SIZE = 100;

function MsgStack(){
    this.array = [];
    this.max   = DEFAULT_MSG_SIZE;
    this.index = -1;
}

MsgStack.prototype.push = function(msg){
    if(this.array.length >= this.max){
        this.array.pop();
    }
    this.index++;
    this.array.unshift(msg);
};

MsgStack.prototype.reset = function(){
    this.array = [];
    this.index = -1;
};

function PreviewConsole(){
    View.call(this,null);

    this._msgStack = new MsgStack();
    this._element = null;
    this._outputList = null;
    this._offsetLine = 0;
    this._offsetColumn = 0;

    this._logLineInfo = false;
    this._autoComp    = true;

    this._logCount = null;
    this._btnAutoComp = null;
    this._btnLogExt = null;
    this._btnReload = null;
}

PreviewConsole.prototype = Object.create(View.prototype);
PreviewConsole.prototype.constructor = PreviewConsole;

PreviewConsole.prototype.load = function(){
    this._element    = document.getElementById('preview-console');
    this._outputList = document.getElementById('console-output-list');

    this._logCount    = document.getElementById('console-log-count');
    this._btnAutoComp = document.getElementById('console-btn-auto-compile');
    this._btnLogExt   = document.getElementById('console-btn-log-extend');
    this._btnReload   = document.getElementById('console-btn-reload');

    this._logResizeHandle = null;

    if(this._logLineInfo){
        this._btnLogExt.classList.add('check-active');
    }
    if(this._autoComp){
        this._btnAutoComp.classList.add('check-active');
    }

    var self = this;
    this._btnAutoComp.addEventListener('click',function(){
        self._autoComp = !self._autoComp;
        this.classList.toggle('check-active');
        self.emit('auto-comp-change',self._autoComp);
    });

    this._btnLogExt.addEventListener('click',function(){
        self._logLineInfo = !self._logLineInfo;
        this.classList.toggle('check-active');
        self.emit('log-line-info-change',self._logLineInfo);
        self.emit('reload');
    });

    this._btnReload.addEventListener('click',function(){
        self.emit('reload');
    });

    this.initResizeHandler();

};

PreviewConsole.prototype.enableLogLineInfo = function(enable){
    this._logLineInfo = enable;
};

PreviewConsole.prototype.setOffset = function(line,column){
    this._offsetLine = line || 0;
    this._offsetColumn = column || 0;
};

PreviewConsole.prototype.logReset = function(){
    this._msgStack.max = DEFAULT_MSG_SIZE;
    this._msgStack.reset();
    this._outputList.innerHTML = '';
};

function getErrorObject(){
    try { throw Error('') } catch(err) { return err; }
}

PreviewConsole.prototype.logStatic = function(args){
    var argsLen = arguments.length;

    if(argsLen === 0){
        return;
    }

    var lineInfo = null;
    if(this._logLineInfo){
        lineInfo    = getErrorObject().stack.match('anonymous>:(.*)\\)')[1].split(':');
        lineInfo[0] = +lineInfo[0] + this._offsetLine;
        lineInfo[1] = +lineInfo[1] + this._offsetColumn;
    }

    var out = new Array(argsLen);
    for(var i = 0; i < argsLen; ++i){
        out[i] = JSON.stringify(arguments[i]);
    }

    out.unshift(this._msgStack.index + 1);
    out.push(lineInfo);

    this._msgStack.push(out);
};

PreviewConsole.prototype.logPopulate = function(){
    var array = this._msgStack.array;

    if(array.length === 0){
        return;
    }

    function parseMsg(item){
        var msg_ = '';
        for(var i = 1, l = item.length - 1; i < l; ++i){
            msg_ += JSON.stringify(item[i]) + ', ';
        }
        return msg_.substr(0,msg_.length-2)
    }

    var msg   = '';
    if(this._logLineInfo){
        for(var i = 0, l = array.length; i < l; ++i){
            var item = array[i];
            var k_1  = item.length - 1;
            var msg_ = parseMsg(item);

            msg +=
                '<li>' +
                '<span class="output-index">' + item[0] + '</span>   ' +
                msg_ +
                '<span class="output-line-info">' + item[k_1][0] + ':' + item[k_1][1] + '</span>' +
                '</li>';
        }

    } else {
        for(var i = 0, l = array.length; i < l; ++i){
            var item = array[i];
            var msg_ = parseMsg(item);

            msg +=
                '<li>' +
                '<span class="output-index">' + item[0] + '</span>   ' +
                msg_ +
                '</li>';
        }
    }

    this._outputList.innerHTML = msg;
    this._logCount.textContent = this._msgStack.index + ':' + this._msgStack.max;
};

PreviewConsole.prototype.expand = function(){
    //this._element.classList.remove('collapse');
    //this._updateElementSizePrevAndEmitResize();
};

PreviewConsole.prototype.collapse = function(){
    //this._element.classList.add('collapse');
    //this._updateElementSizePrevAndEmitResize();
};

PreviewConsole.prototype.getNumMessages = function(){
    return this._msgStack.index + 1;
};

module.exports = PreviewConsole;