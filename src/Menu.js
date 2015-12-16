'use strict';

/*--------------------------------------------------------------------------------------------------------------------*/
// IMPORT
/*--------------------------------------------------------------------------------------------------------------------*/

var Menu = require('menu');

/*--------------------------------------------------------------------------------------------------------------------*/
// MENU
/*--------------------------------------------------------------------------------------------------------------------*/

var template = [{
    // Application

    label : "Application",
    submenu : [
        {
            label    : "About Application",
            selector : "orderFrontStandardAboutPanel:"
        }, {
            type : "separator"
        }, {
            label       : "Quit",
            accelerator : "Command+Q"
        }
    ]
}, {
    // File

    label : 'File',
    submenu : [
        {
            label       : 'New File',
            accelerator : 'Command+N'
        }, {
            label       : 'Open...',
            accelerator : 'Command+O'
        }, {
            label : 'Open Recent'
        }, {
            type : 'separator'
        }, {
            label       : 'Close',
            accelerator : 'Command+W'
        }, {
            label       : 'Save',
            accelerator : 'Command+S'
        }, {
            label : 'Duplicate',
            accelerator : 'Command+Shift+S'
        },{
            type : 'separator'
        },{
            label : 'Export',
            submenu : [{
                    label : 'Export HTML'
                },{
                    label : 'Export PDF'
                },{
                    label : 'Export PNG'
                },{
                    label : 'Export Common Markdown'
                },{
                    label : 'Export Common Markdown (Embedded)'
                }
            ]
        }
    ]
}, {
    // Edit

    label : "Edit",
    submenu : [
        {
            label : "Undo",
            accelerator : "CmdOrCtrl+Z",
            selector : "undo:"
        }, {
            label : "Redo",
            accelerator : "Shift+CmdOrCtrl+Z",
            selector : "redo:"
        }, {
            type : "separator"
        }, {
            label : "Cut",
            accelerator : "CmdOrCtrl+X",
            selector : "cut:"
        }, {
            label : "Copy",
            accelerator : "CmdOrCtrl+C",
            selector : "copy:"
        }, {
            label : "Paste",
            accelerator : "CmdOrCtrl+V",
            selector : "paste:"
        }, {
            label : "Select All",
            accelerator : "CmdOrCtrl+A",
            selector : "selectAll:"
        }
    ]
}, {
    // Format

    label : "Format",
    submenu : [
        {
            label : 'Find'
        }
    ]
}, {
    // View

    label : "View",
    submenu : [
        {
            label       : "Toggle Editor View",
            accelerator : 'Ctrl+Command+E'
        }, {
            label       : 'Toggle Editor Gutter',
            accelerator : 'Ctrl+Command+G'
        }, {
            label       : 'Toggle Preview View',
            accelerator : 'Ctrl+Command+P'
        }, {
            type : 'separator'
        }, {
            label       : 'Toggle Presentation Mode',
            accelerator : 'Ctrl+Command+R'
        }, {
            label : "Reset Font Size"
        }, {
            label       : "Increase Font Size",
            accelerator : 'Ctrl+Command+Plus'
        }, {
            label       : 'Decrease Font Size'
        }, {
            type : 'separator'
        }, {
            label       : 'Toggle Full Screen',
            accelerator : 'Ctrl+Command+F'
        }
    ]
}
];

var menu = Menu.buildFromTemplate(template);


/*--------------------------------------------------------------------------------------------------------------------*/
// EXPORT
/*--------------------------------------------------------------------------------------------------------------------*/

var quit = menu.items[0].submenu.items[2];

var fileNew        = menu.items[1].submenu.items[0];
var fileOpen       = menu.items[1].submenu.items[1];
var fileOpenRecent = menu.items[1].submenu.items[2];
    //--
var fileClose     = menu.items[1].submenu.items[4];
var fileSave      = menu.items[1].submenu.items[5];
var fileDuplicate = menu.items[1].submenu.items[6];

var editUndo = menu.items[2].submenu.items[0];
var editRedo = menu.items[2].submenu.items[1];
    //-
var editCut       = menu.items[2].submenu.items[3];
var editCopy      = menu.items[2].submenu.items[4];
var editPaste     = menu.items[2].submenu.items[5];
var editSelectAll = menu.items[2].submenu.items[6];

var formatFind = menu.items[3].submenu.items[0];

var viewToggleEditor  = menu.items[4].submenu.items[0];
var viewToggleGutter  = menu.items[4].submenu.items[1];
var viewTogglePreview = menu.items[4].submenu.items[2];
//--
var viewTogglePresentation = menu.items[4].submenu.items[4];
var viewResetFontSize      = menu.items[4].submenu.items[5];
var viewIncreaseFontSize   = menu.items[4].submenu.items[6];
var viewDecreaseFontSize   = menu.items[4].submenu.items[7];
//--
var viewToggleFullscreen = menu.items[4].submenu.items[9];

function enableDocumentMenu(enable,documentEdited){
    documentEdited = documentEdited === undefined ? false : documentEdited;

    fileClose.enabled = enable;
    fileSave.enabled = enable ? documentEdited : false;
    fileOpenRecent.enabled =
    fileClose.enabled =
    fileDuplicate.enabled = enable;

    editUndo.enabled =
    editRedo.enabled =
    editCut.enabled =
    editCopy.enabled =
    editPaste.enabled =
    editSelectAll.enabled = enable;

    formatFind.enabled = enable;

    viewToggleEditor.enabled =
    viewToggleGutter.enabled =
    viewTogglePreview.enabled = enable;

    viewResetFontSize.enabled =
    viewIncreaseFontSize.enabled =
    viewDecreaseFontSize.enabled = enable;

    if(!enable){
        return;
    }

    enableWindowViewMenu(enable);
}

function enableWindowViewMenu(enable){
    viewTogglePresentation.enabled =
    viewToggleFullscreen.enabled = enable;
}

enableDocumentMenu(false);
enableWindowViewMenu(false);

module.exports = {
    menu : menu,
    quit : quit,

    fileNew        : fileNew,
    fileOpen       : fileOpen,
    fileOpenRecent : fileOpenRecent,
    //--
    fileClose     : fileClose,
    fileSave      : fileSave,
    fileDuplicate : fileDuplicate,

    editUndo : editUndo,
    editRedo : editRedo,
    //--
    editCut       : editCut,
    editCopy      : editCopy,
    editPaste     : editPaste,
    editSelectAll : editSelectAll,

    formatFind : formatFind,

    viewToggleEditor  : viewToggleEditor,
    viewToggleGutter  : viewToggleGutter,
    viewTogglePreview : viewTogglePreview,
    //--
    viewTogglePresentation : viewTogglePresentation,
    viewResetFontSize      : viewResetFontSize,
    viewIncreaseFontSize   : viewIncreaseFontSize,
    viewDecreaseFontSize   : viewDecreaseFontSize,
    //--
    viewToggleFullscreen : viewToggleFullscreen,

    enableDocumentMenu : enableDocumentMenu,
    enableWindowViewMenu : enableWindowViewMenu
};