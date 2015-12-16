const fs = require('fs');
const path = require('path');

const remote = require('remote');
const Menu   = remote.Menu;
const clipboard = require('clipboard');
const NativeImage = require('native-image');
const dialog = remote.require('dialog');

var node = null;

function getBase64ImageBuffer(str) {
    var data = str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (data.length !== 3) {
        throw new Error('Invalid base64 data string');
    }
    return new Buffer(data[2], 'base64');
}

var renderImgContextMenu = Menu.buildFromTemplate([
    {label : 'Copy', click : function(){
        clipboard.writeImage(NativeImage.createFromDataURL(node.src.toString()));
    }},

    {label : 'Copy Base64 Data URI', click: function(){
        clipboard.writeText(node.src.toString());
    }},

    {label : 'Copy Dom Node', click : function(){
        clipboard.writeText(node.outerHTML.toString());
    }},

    {label : 'Save Image As...', click : function(){
        var type = node.src.match('image/(.*);')[1];

        var extensions = null;
        switch(type){
            case 'png':
            case 'jpg':
            case 'jpeg':
                extensions = ['png','jpg'];
                break;

            case 'gif':
                extensions = ['gif'];
                break;
        }

        var result = dialog.showSaveDialog(null,{
            defaultPath : 'image',
            filters : [{ name: 'Images', extensions: extensions }]
        });

        if(result === undefined){
            return;
        }

        fs.writeFileSync(result,getBase64ImageBuffer(node.src.toString()).data);
    }}
]);

function bind(target){
    target.addEventListener('contextmenu',function(e){
        node = this;
        renderImgContextMenu.popup(remote.getCurrentWindow());
        e.preventDefault();
    })
}

module.exports = {
    bind : bind
};