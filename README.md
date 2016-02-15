
    这是一个微小、简单、但却强大的模块加载器，使用极其简单，遵从AMD模块规范。

    如果您不信，可以比较之试试看！^_^

### 当模块之间发生循环依赖时，会有错误警告提示。  


```html
<script src="loader.js"></script>
<script>
    window.define  = Loader.define;
    window.require = Loader.require;

   /** 
    * 所有的参数都是可选的
    * Loader.config({
    *      jsMap       : {'modName' : 'js/mod/'},  // 模块名字与对应路径 支持远程路径
    *      jsPath      : 'js/',                    // jsMap会优先于jsPath
    *      isTestEnv   : true,                     // 默认为true
    *      isCache     : true,                     // 只应用于测试环境中
    *      version     : '2016020401',             // 只应用于正式环境中
    *      combo       : function(arrModName){}    // 是否启用combo加载脚本，函数参数为模块名字数组
    * });
    */

    require(['init'], function(){
        console.log('success!');
    });
</script>
```
