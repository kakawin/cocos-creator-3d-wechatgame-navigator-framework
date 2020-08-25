require('./libs/wrapper/builtin/index');
window.DOMParser = require('./libs/common/xmldom/dom-parser').DOMParser;
require('./libs/common/engine3d/globalAdapter/index');
require('./libs/wrapper/unify');
require('./libs/wrapper/systemInfo');

// Polyfills bundle.
require("src/polyfills.bundle.js");
// SystemJS support.
require("src/system.bundle.js");
// Manifest file.
require('src/settings');
// Contains window.boot() which bootstrap the logic.
require('wxsdk.min.js');
require('main');

var boot = window.boot;
// WeChatGame supports naturally CommonJS.
// So we use require to load engine, and register the engine module using SystemJS named register.
boot.prepare.engine = function() {
    
    var ccGlobal = require('cocos3d-js.min');
    
    System.register('cc', [], function (_export, _context) {
        return {
            setters: [],
            execute: function () {
                _export(ccGlobal);
            }
        };
    });
};
boot.prepare.loadIIFE = function (url) {
    require(url);
};
boot.prepare.findCanvas = function () {
    var frame;
    var container;
    frame = container = document.createElement('div');
    var canvas = window.canvas;
    return { frame, canvas, container };
};

// Adapt for IOS, swap if opposite
if (canvas){
    var _w = canvas.width;
    var _h = canvas.height;
    if (screen.width < screen.height) {
        if (canvas.width > canvas.height) {
            _w = canvas.height;
            _h = canvas.width;
        }
    } else {
        if (canvas.width < canvas.height) {
            _w = canvas.height;
            _h = canvas.width;
        }
    }
    canvas.width = _w;
    canvas.height = _h;
}
// Adjust initial canvas size
if (canvas && window.devicePixelRatio >= 2) {canvas.width *= 2; canvas.height *= 2;}

window.__globalAdapter.init(function() {
    var boot = window.boot;
    boot.prepare().
        then(function() {
            require('./libs/common/engine3d/index.js');
            require('./libs/common/remote-downloader.js');
            // Adjust devicePixelRatio
            cc.view._maxPixelRatio = 2;
            // downloader polyfill
            remoteDownloader.REMOTE_SERVER_ROOT = '';
            remoteDownloader.SUBCONTEXT_ROOT = '';
            var pipeBeforeDownloader = cc.loader.md5Pipe || cc.loader.subPackPipe || cc.loader.assetLoader;
            cc.loader.insertPipeAfter(pipeBeforeDownloader, remoteDownloader);
            window.wxDownloader = remoteDownloader;

            require('./libs/wrapper/engine/index');
            if (cc.sys.browserType === cc.sys.BROWSER_TYPE_WECHAT_GAME_SUB) {
                var _WECHAT_SUBDOMAIN_DATA = require('src/subdomain.json.js');
                cc.game.once(cc.game.EVENT_ENGINE_INITED, function() {
                    cc.Pipeline.Downloader.PackDownloader._doPreload('WECHAT_SUBDOMAIN', _WECHAT_SUBDOMAIN_DATA);
                });
                require('./libs/wrapper/sub-context-adapter');
            } else {
                // Release Image objects after uploaded gl texture
                cc.macro.CLEANUP_IMAGE_CACHE = true;
            }
            remoteDownloader.init();
            boot();
        });
});
