/**
 * @name    : Loader
 * @version : 1.0.0
 * @author  : wfz
 *
 * Loader.config({
 *      jsMap       : {'modName' : 'js/mod/'},  // 模块名字与对应路径 支持远程路径
 *      jsPath      : 'js/',                    // jsMap会优先于jsPath
 *      isTestEnv   : true,                     // 默认为true
 *      isCache     : true,                     // 只应用于测试环境中
 *      version     : '2016020401',             // 只应用于正式环境中
 *      combo       : function(arrModName){}    // 是否启用combo加载脚本，函数参数为模块名字数组
 * });
 * Loader.define
 * Loader.require
 */
(function () {
    var T = {
        each : function (arr, fn) {
            if(arr.forEach) {
                arr.forEach(fn);
            }else{
                for (var i = 0, l = arr.length; i < l; i++) {
                    fn(arr[i], i, arr);
                }
            }
        },

        random : function(under, over){
            return parseInt(Math.random()*(over-under+1) + under);
        },

        getScript : function (url) {
            var script = document.createElement('script');
            script.onload = function() {
                script.onload = script.onreadystatechange = null;
                script.parentNode.removeChild(script);
            };
            script.src = url;
            document.head.appendChild(script);
        }
    };

    var AMDLoader = function(){
        var definedMod  = {},
            loadingMod  = {},
            waitingMod  = [];

        var cfg = {
            allItems    : ['jsPath', 'jsMap', 'version', 'isTestEnv', 'isCache', 'combo'],
            isTestEnv   : true,
            isCache     : true,
            combo       : null,
            version     : '',
            jsPath      : 'js/',
            jsMap       : {}
        };

        var oFragment   = document.createDocumentFragment();

        function loadMod(name){
            if( /^http/.test(cfg.jsMap[name]) ){
                T.getScript( cfg.jsMap[name] ); return;
            }
            var url         = '';
            var pathname    = location.pathname;
            var fileDir     = (cfg.jsMap[name] || cfg.jsPath).replace(/^(\.|\/)*/,''); 
            var filePath    = fileDir + name + '.js';
            pathname        = pathname.slice(0, pathname.lastIndexOf('/')+1);
            pathname        = location.protocol.indexOf('http')>-1 ? pathname : '';
            url             = pathname + (cfg.isTestEnv ? '' : cfg.version + '/') + filePath;
            url             = url + (cfg.isCache ? '' : '?v=' + new Date().getTime());
            T.getScript(url);
        }

        function isAllModExists(depArr){
            for (var i = 0, l = depArr.length; i < l; i++) {
                var mod = definedMod[ depArr[i] ];
                if(!mod) return false;
            }
            return true;
        }

        function getDepMods(depArr) {
            var depMods = [];
            T.each(depArr, function(name) {
                depMods.push(definedMod[name]);
            });
            return depMods;
        }

        function defineWaitMod(){
            for(var i = 0, l = waitingMod.length; i < l; i++) {
                var item = waitingMod.shift();
                define(item.name, item.depArr, item.fn);
            }
        }

        return {
            config : function(opt){
                opt && T.each(cfg.allItems, function(value){
                    typeof opt[value] != 'undefined' && (cfg[value] = opt[value]);
                });
            },

            define : function (id, dependencies, factory){
                var name    = id,
                    depArr  = dependencies;
                    fn      = factory;

                if( !oFragment.querySelector('#' + name) ){
                    var node = document.createElement('span');
                    node.id  = name;
                    oFragment.appendChild(node);
                }

                if( isAllModExists(depArr) ){
                    var r = fn.apply( '', getDepMods(depArr) );
                    !/^_privateId_/.test(name) && (definedMod[name] = r);
                    loadingMod[name] = false;
                    defineWaitMod();
                } else {
                    waitingMod.push({name:name, depArr:depArr, fn:fn});
                    var arrModName = [];
                    for (var i = 0, l = depArr.length; i < l; i++) {
                        var _name = depArr[i];

                        if( !oFragment.querySelector('#' + name + ' #' + _name) ){
                            var subMod = oFragment.querySelector('#' + _name);
                            var parentMod = oFragment.querySelector('#' + name);

                            if( subMod && subMod.contains(parentMod) ){
                                throw new Error(name + ' module and ' + _name +
                                    ' module cause a loop dependency error!'); 
                                return;
                            }

                            var node = document.createElement('span');
                            node.id  = _name;
                            parentMod.appendChild(node);
                        }

                        if( definedMod[_name]  || loadingMod[_name]) { continue; }
                        loadingMod[_name] = true;
                        if(typeof cfg.combo == 'function'){
                            arrModName.push(_name);
                        }else{
                            loadMod(_name);
                        }
                    }
                    arrModName.length && cfg.combo(arrModName);
                }
            },

            require : function (dependencies, factory) {
                AMDLoader.define('_privateId_' + T.random(0, 10000) + '_' + Date.now(), dependencies, factory);
            }
        };
    }();

    typeof exports != 'undefined' ? exports.Loader = AMDLoader : window.Loader = AMDLoader;
})();
