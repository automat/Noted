const path = require('path');
const fs   = require('fs');

const PATH_SETTINGS         = path.resolve(__dirname,'../settings.json');
const PATH_SETTINGS_DEFAULT = path.resolve(__dirname,'../settings-default.json');
const PATH_DOCUMENTS        = path.resolve(process.env.HOME,'documents');

const FILTER_KEYS = [
    'save',
    'path_documents'
];

var settings;

try{
    settings = JSON.parse(fs.readFileSync(PATH_SETTINGS,'utf8'));

} catch(e) {
    try {
        settings = JSON.parse(fs.readFileSync(PATH_SETTINGS_DEFAULT,'utf8'));
    } catch(e) {
        throw new Error('Unable to read default settings.');
    }
    fs.writeFileSync(PATH_SETTINGS,JSON.stringify(settings,null,4),'utf8',function(err){
        if(!err){
            return;
        }
        throw new Error('Unable to reset to default settings.');
    });

}

function save(){
    var settings_ = {};
    for(var key in settings){
        if(FILTER_KEYS.indexOf(key) !== -1){
            continue;
        }
        settings_[key] = settings[key];
    }

    fs.writeFileSync(PATH_SETTINGS, JSON.stringify(settings_,null,4), 'utf8', function(err){
            if(!err){
                return;
            }
            throw new Error('Failed saving settings.');
        }
    );
}

settings.path_documents = PATH_DOCUMENTS;
settings.save = save;

global.noted = global.noted || {};
global.noted.settings = settings;