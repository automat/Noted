const RenderContextMenu   = require('./MarkdownTransformRenderMenu');
const CoffeeScript = require('coffee-script');

const TAG_CANVAS_IMG = 'canvas-img';
const TAG_CANVAS_GIF = 'canvas-gif';
const TAG_SVG        = 'svg';
const TAGS           = [TAG_CANVAS_IMG,TAG_CANVAS_GIF, TAG_SVG];

const DEFAULT_CANVAS_IMG_CONFIG = {
    'width'  : 200,
    'height' : 200,
    'render' : true,
    'keep-code' : false
};

const DEFAULT_CANVAS_GIF_CONFIG = {
    'width'  : 200,
    'height' : 200,
    'render' : true,
    'keep-code' : false,

    'quality' : 10,
    'repeat' : 0,
    'fps' : 10,
    'duration' : 1000
};

const DEFAULT_SVG_CONFIG = {
    'width'  : 200,
    'height' : 200,
    'render' : true,
    'keep-code' : false
};

const TAG_DEFAULT = {
    'canvas-img' : DEFAULT_CANVAS_IMG_CONFIG,
    'canvas-gif' : DEFAULT_CANVAS_GIF_CONFIG,
    'svg'        : DEFAULT_SVG_CONFIG
};

const CLASSES_JS = [
    'language-javascript',
    'language-js'
];

const CLASSES_COFFEE = [
    'language-coffee',
    'language-coffeescript'
];

const TRANSFORMABLE_CLASSES = [
    CLASSES_JS[0], CLASSES_JS[1],
    CLASSES_COFFEE[0], CLASSES_COFFEE[1]
];

const MAX_INCR = 100000;

const INF_DETECT_INCR =
    'if(++__infDetect >= MAX_INCR)throw new Error("Infinite Loop");';

const CONTEXT_LIBRARIES =
    'd3Shape = require("d3-shape");';

const CONTEXT_BEGIN =
    '__INF_DETECT_MAX = ' + MAX_INCR + ';' +
    '__infDetect = 0;' +
    '__docdirname = window.__docdirname;' +
    'window.__logReset();' +
    'log = window.__logStatic.bind(window);' +
    CONTEXT_LIBRARIES;



function getErrInfo(err){
    var stack    = err.stack;
    var lines    = stack.split('\n');
    var msg      = lines[0];
    var lineRow  = lines[1].match('anonymous>:(.*)\\)');

    var out = {msg:msg, line:null, row:null};

    if(lineRow !== null){
        lineRow    =  lineRow[1].split(':');
        lineRow[0] = +lineRow[0] - 4;
        lineRow[1] = +lineRow[1] - 1;

        out.line = lineRow[0];
        out.row  = lineRow[1];
    }

    return out;
}

function highlightErrNode(node,msg){
    node.style.color = '#fff';
    node.parentNode.style.background = '#ff0000';
    node.textContent = msg;
}

function getConfig(nodeContent, tag){
    if(nodeContent.indexOf(tag) === -1){
        throw new Error('Tag not present');
    }
    var options = nodeContent.trim().split('\n')[0].trim();

    if(options.indexOf(tag) === -1 || options.indexOf('(' + tag  +')') !== 0){
        throw new Error('Tag not at beginning of code block');
    }

    options = options.match('\\('+ tag + '\\)\\{(.*)\\}');

    if(options === null){
        return null;
    }

    var default_config = TAG_DEFAULT[tag];
    var errPrefix      = 'Invalid Option: ';

    options = options[1].trim().split(' ');

    //empty options
    if(options.length !== 0 && options[0] !== ''){

        function parseOption(entry){
            var operatorCount = entry.split('=').length - 1;

            //no assignment operator
            if(operatorCount !== 1){
                throw TypeError(errPrefix + entry);
            }

            var operatorIndex = entry.indexOf('=');
            var lhs = entry.substr(0,operatorIndex);

            var default_ = default_config[lhs];

            //lhs key not defined in defaults
            if(default_ === undefined){
                throw TypeError(errPrefix + 'invalid key "' + lhs + '"');
            }

            var rhs = entry.substr(operatorIndex+1);

            //empty rhs
            if(rhs === ''){
                throw TypeError(errPrefix + '"' + lhs + '" no assignment');
            }

            if(rhs == 'true' || rhs == 'false'){
                rhs = rhs == 'true';

                //rhs differing types, default is non-bool
                if(typeof rhs !== typeof default_){
                    throw TypeError(errPrefix + '"' + lhs + '" wrong type rhs');
                }

                return [lhs,rhs];
            }

            rhs = +rhs;
            //rhs no number
            if(isNaN(rhs) || typeof rhs !== typeof default_){
                throw TypeError(errPrefix + '"' + lhs + '" should be of type Number');
            }

            return [lhs,rhs];
        }

        var options_ = {};
        for(var i = 0,l = options.length; i < l; ++i){
            var option  = options[i];
            var option_ = parseOption(option);
            if(option_ === null){
                throw TypeError(errPrefix + option);
            }
            options_[option_[0]] = option_[1];
        }

        for(var key in default_config){
            if(options_[key] !== undefined){
                continue;
            }
            options_[key] = default_config[key];
        }

        return options_;
    }

    return null;
}

function js(node,funcBodyWrap,processFuncReturn){
    var node_     = node.node;
    var document_ = node_.ownerDocument;
    var window_   = document_.defaultView;

    var codeBodyInfo = getCodeBodyInfo(node_.textContent);
    var config       = node.config;
    var codeBody     = codeBodyInfo.code;
    var indentation  = codeBodyInfo.indentation;

    var returnVal;

    try{
        var funcBody =
            CONTEXT_BEGIN +
            funcBodyWrap(config,codeBody);

        returnVal = Function('window',funcBody).call(window_,window_);

    } catch(e) {
        var info = getErrInfo(e);
        highlightErrNode(node_, info.msg + '@ script :' + info.line + ':' + info.row);
        return false;
    }

    if(processFuncReturn !== undefined){
        returnVal = processFuncReturn(returnVal);
    }

    RenderContextMenu.bind(returnVal);
    injectTransform(node_,returnVal,codeBody,config['keep-code']);
    window_.__logPopulate();

    return true;
}

function imgJs(node){
    return js(
        node,
        function(config,codeBody){
            return '' +
                'var canvas = document.createElement("canvas");' +
                'canvas.width = ' + config.width + ';' +
                'canvas.height = ' + config.height + ';' +
                'var ctx = canvas.getContext("2d");' +
                'window.__logSetOffset(-6,1);\n' +
                codeBody + '\n' +
                'return canvas.toDataURL();';
        },
        function(value){
            var img = node.node.ownerDocument.createElement('img');
                img.src = value;
            return img;
        }
    );
}

function gifJs(node){
    return js(
        node,
        function(config,codeBody){
            return '' +
                'const GifEncoder = require("gifencoder");' +
                'var canvas = document.createElement("canvas");' +
                'canvas.width = ' + config.width + ';' +
                'canvas.height = ' + config.height + ';' +
                'var ctx = canvas.getContext("2d");' +
                'window.__logSetOffset(-6,1);' +
                'var gif = new GifEncoder(canvas.width,canvas.height);' +
                'gif.start();' +
                'gif.setQuality(' + config.quality + ');' +
                'gif.setFrameRate(' + config.fps + ');' +
                'gif.setRepeat(' + config.repeat + ');' +
                'for(var __frame = 0, ' +
                    '__durationMs = ' + config.duration + ',' +
                    '__fps = ' + config.fps + ',' +
                    '__numFrames = Math.floor(__durationMs / 1000 * __fps); ' +
                    '__frame < __numFrames; ' +
                    '++__frame){' +
                    '(function(frame, numFrames, duration, fps){\n' +
                        codeBody + '\n' +
                        'gif.addFrame(ctx);' +
                    '})(__frame,__numFrames,__durationMs,__fps);' +
                '}' +
                'gif.finish();' +
                'var base64 = gif.out.getData().toString("base64");' +
                'return "data:image/gif;base64," + base64;';
        },
        function(value){
            var img = node.node.ownerDocument.createElement('img');
                img.src = value;
            return img;
        }
    );
}

function svgJs(node){
    return js(
        node,
        function(config,codeBody){
            return '' +
                'var svgNode = document.createElementNS("http://www.w3.org/2000/svg", "svg");' +
                'svgNode.setAttribute("width",' + config.width + ');' +
                'svgNode.setAttribute("height",' + config.height + ');' +
                'svgNode.setAttribute("viewbox","0 0 ' + config.width + ' ' + config.height + '");' +
                //'svgNode.setAttribute("preserveAspectRatio" ,"none");' +
                'window.__logSetOffset(-6,1);\n' +
                codeBody + '\n' +
                'return svgNode;'
        }
    );
}

function svgCoffee(node){
    return coffee(
        node,
        function(config,codeBody){
            return '' +
                'svgNode = document.createElementNS("http://www.w3.org/2000/svg", "svg");' +
                'svgNode.setAttribute("width",' + config.width + ');' +
                'svgNode.setAttribute("height",' + config.height + ');' +
                'svgNode.setAttribute("viewbox","0 0 ' + config.width + ' ' + config.height + '");' +
                'svgNode.setAttribute("preserveAspectRatio" ,"none");' +
                'window.__logSetOffset(-6,1);\n' +
                codeBody + '\n' +
                'return svgNode;'
        }
    )
}

function coffee(node,funcBodyWrap,processFuncReturn){
    var node_     = node.node;
    var document_ = node_.ownerDocument;
    var window_   = document_.defaultView;

    var codeBodyInfo = getCodeBodyInfo(node_.textContent);
    var config       = node.config;
    var codeBody     = codeBodyInfo.code;
    var indentation  = codeBodyInfo.indentation;

    var returnVal;

    codeBody = codeBody.split('\n');
    for(var i = 0, l = codeBody.length; i < l; ++i){
        codeBody[i] = codeBody[i].slice(indentation);
    }
    codeBody = codeBody.join('\n');

    var funcBody;
    try{
        funcBody =
            funcBodyWrap(config,codeBody);

        funcBody = CoffeeScript.compile(funcBody);

    } catch(e){
        var info = getErrInfo(e);
        highlightErrNode(node_, info.msg + '@ script :' + info.line + ':' + info.row);
        return false;
    }

    funcBody = funcBody.split('\n');
    funcBody = funcBody.slice(1,funcBody.length - 2);
    funcBody = funcBody.filter(function(item){
        return item !== '';
    }).join('\n');

    try{
        funcBody =
            CONTEXT_BEGIN + '' +
            'window.__logSetOffset(-6,1);' +
            funcBody;


        returnVal = Function('window',funcBody).call(window_,window_);

    } catch(e) {
        var info = getErrInfo(e);
        highlightErrNode(node_, info.msg + '@ script :' + info.line + ':' + info.row);
        return false;
    }

    if(processFuncReturn !== undefined){
        returnVal = processFuncReturn(returnVal);
    }

    RenderContextMenu.bind(returnVal);
    injectTransform(node_,returnVal,codeBody,config['keep-code']);
    window_.__logPopulate();

    return true;
}

function imgCoffee(node){
    return coffee(
        node,
        function(config,codeBody){
            return '' +
                'canvas = document.createElement("canvas");' +
                'canvas.width = ' + config.width + ';' +
                'canvas.height = '  + config.height + ';' +
                'ctx = canvas.getContext("2d");\n' +
                codeBody + '\n' +
                'return canvas.toDataURL();';
        },
        function(value){
            var img = node.node.ownerDocument.createElement('img');
            img.src = value;
            return img;
        }
    );
}

function gifCoffee(node){
    return coffee(
        node,
        function(config,codeBody){
            codeBody = codeBody.split('\n');
            for(var i = 0, l = codeBody.length; i < l; ++i){
                codeBody[i] = '       ' + codeBody[i];
            }
            codeBody = codeBody.join('\n');

            return '' +
                'GifEncoder = require("gifencoder");' +
                'canvas = document.createElement("canvas");' +
                'canvas.width = ' + config.width + ';' +
                'canvas.height = '  + config.height + ';' +
                'ctx = canvas.getContext("2d");' +
                'gif = new GifEncoder(canvas.width,canvas.height);' +
                'gif.start();' +
                'gif.setQuality(' + config.quality + ');' +
                'gif.setFrameRate(' + config.fps + ');' +
                'gif.setRepeat(' + config.repeat + ');' +
                '__durationMs = ' + config.duration + ';' +
                '__fps = ' + config.fps + ';' +
                '__numFrames = Math.floor(__durationMs / 1000 * __fps);\n' +
                'for __frame in [0...__numFrames]\n' +
                '   do (__frame, __numFrames, __durationMs, __fps) ->\n' +
                '       frame = __frame;' +
                'numFrames = __numFrames;' +
                'duration = __durationMs;' +
                'fps = __fps;'  +
                '       ' + codeBody + '\n' +
                '       gif.addFrame(ctx);\n' +
                'gif.finish();\n' +
                'base64 = gif.out.getData().toString("base64");\n' +
                'return "data:image/gif;base64," + base64;\n';
        },
        function(value){
            var img = node.node.ownerDocument.createElement('img');
            img.src = value;
            return img;
        }
    );
}


function injectTransform(node,element,codeBody,keepCode){
    var document_ = node.ownerDocument;

    if(!keepCode){
        var pelement = document_.createElement('p');
            pelement.appendChild(element);

        node.parentNode.parentNode.insertBefore(pelement, node.parentNode);
        document_.body.removeChild(node.parentNode);

    } else {
        node.textContent = codeBody;
        node.parentNode.parentNode.insertBefore(element,node.parentNode);
    }
}

function injectBtn(node){
    var node_ = node.node;
    var desc  = null;

    var img, gif, svg, render;
    switch(node_.className){
        case CLASSES_JS[0]:
        case CLASSES_JS[1]:
            img = imgJs;
            gif = gifJs;
            svg = svgJs;
            break;

        case CLASSES_COFFEE[0]:
        case CLASSES_COFFEE[1]:
            img = imgCoffee;
            gif = gifCoffee;
            svg = svgCoffee;
            break;
    }

    switch(node.tag){
        case TAG_CANVAS_IMG:
            render = img;
            desc   = 'img';
            break;

        case TAG_CANVAS_GIF:
            render = gif;
            desc   = 'gif';
            break;

        case TAG_SVG:
            render = svg;
            desc   = 'svg';
            break;
    }

    var btn = node_.ownerDocument.createElement('div');
        btn.setAttribute('class','btn-transform-run');
        btn.textContent = 'render ' + desc;
        btn.addEventListener('click',function(){
            render(node);
            this.parentNode.removeChild(this);
        });

    node_.parentNode.insertBefore(btn,node_);
}

function getCodeBodyInfo(textContent){
    var code = textContent.split('\n').slice(1);
    var indentation = 0;
    for(var i = 0, l = code.length; i < l; ++i){
        if(code[i].trim().length !== 0){
            //first non empty line defines indentation
            indentation = code[i].search(/\S|$/);
            break;
        }
    }
    code = code.join('\n');
    return {code:code, indentation:indentation};
}

function transformFilteredNodes(filteredNodes){
    var all              = filteredNodes.all;
    var indicesInvalid   = filteredNodes.indicesInvalid;
    var indicesNonRender = filteredNodes.indicesNonRender;
    var indicesRender    = filteredNodes.indicesRender;

    for(var i = 0, l = indicesInvalid.length; i < l; ++i){
        var node = all[indicesInvalid[i]];
        highlightErrNode(node.node,node.config);
    }

    var invalidsRender = [];
    for(var i = 0, l = indicesRender.length; i < l; ++i){
        var index = indicesRender[i];
        var node  = all[index];

        var img, gif, svg;

        switch(node.node.className){
            case CLASSES_JS[0]:
            case CLASSES_JS[1]:
                img = imgJs;
                gif = gifJs;
                svg = svgJs;
                break;

            case CLASSES_COFFEE[0]:
            case CLASSES_COFFEE[1]:
                img = imgCoffee;
                gif = gifCoffee;
                svg = svgCoffee;
                break;
        }

        var valid = true;
        switch(node.tag){
            case TAG_CANVAS_IMG:
                valid = img(node);
                break;

            case TAG_CANVAS_GIF:
                valid = gif(node);
                break;

            case TAG_SVG:
                valid = svg(node);
                break;
        }

        if(!valid){
            invalidsRender.push(index);
        }
    }

    for(var i = 0, l = indicesNonRender.length; i < l; ++i){
        injectBtn(all[indicesNonRender[i]]);
    }
}

function filterTransformNodes(window){
    var document = window.document;
    var filtered = [];

    for(var i = 0, l = TRANSFORMABLE_CLASSES.length; i < l; ++i){
        var nodes = document.getElementsByClassName(TRANSFORMABLE_CLASSES[i]);

        if(nodes.length === 0){
            continue;
        }

        for(var j = 0, k = nodes.length; j < k; ++j){
            var node = nodes[j];

            for(var m = 0, n = TAGS.length; m < n; ++m){
                var tag = TAGS[m];
                if(node.textContent.indexOf(tag) === -1){
                    continue;
                }
                filtered.push({tag: tag, config: null, node: node});
            }
        }
    }

    var indicesRender    = [];
    var indicesNonRender = [];
    var indicesInvalid   = [];

    for(var i = 0, l = filtered.length; i < l; ++i){
        var filtered_ = filtered[i];
        var config    = null;

        try{
            config = getConfig(filtered_.node.textContent,filtered_.tag);
        } catch(e){
            filtered_.config = e.message;
            indicesInvalid.push(i);
            continue;
        }

        if(config === null || config.render === false){
            indicesNonRender.push(i);
        } else {
            indicesRender.push(i);
        }

        filtered_.config = config;
    }

    return {
        all : filtered,
        indicesRender : indicesRender,
        indicesNonRender : indicesNonRender,
        indicesInvalid : indicesInvalid
    };
}

module.exports = {
    filterTransformNodes   : filterTransformNodes,
    transformFilteredNodes : transformFilteredNodes
};


