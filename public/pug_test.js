const pug = require('pug');
const path = require('path');

const filepath = path.join(__dirname, 'template.pug');

// 编译这份代码
const compiledFunction = pug.compileFile(filepath);

// 渲染一组数据
console.log(compiledFunction({
  name: '李莉'
}));
// "<p>李莉的 Pug 代码！</p>"

// 渲染另外一组数据
console.log(compiledFunction({
  name: '张伟'
}));
// "<p>张伟的 Pug 代码！</p>"