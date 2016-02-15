define('init', ['mod-a', 'mod-b'], //'mod-a', 'mod-b', 'mod-c'
function (a, b, c){
    console.log('This is init mod content!');
    return {name:'init'}
});
