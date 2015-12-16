var path =  require('path');
var remote = require('remote');
var noted  = remote.getGlobal('noted');

module.exports = {
    get : function(filepath){
        filepath = filepath.split(' ').join('%20');

        var snippet = null;
        var extname = path.extname(filepath);

        if(extname === null){
            return snippet;
        }

        extname = extname.substring(1);

        var usePlugins = noted.settings.markdown.use_plugins;

        switch(extname){
            case 'jpeg':
            case 'jpg':
            case 'png':
            case 'tiff':
            case 'svg':
            case 'gif':
                snippet =  '![](' + filepath + ')';
                break;
            case 'mp4':
                if(usePlugins){

                } else {
                    snippet = '<video src="' + filepath + '"></video>';
                }
                break;
            default:
                break;
        }
        return snippet;
    }
};