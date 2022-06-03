var fs = require("fs");
var path = require('path');

var picData = []

// 初始化头像图片数据
// const files = fs.readdirSync(path.join('../view/TinyIcons/'))
// files.forEach(function (item, index) {
//     let stat = fs.lstatSync(path.join('../view/TinyIcons/') + item)
//     if (stat.isDirectory() === true) { 
//       picData.push(item)
//     }
// })
const files = fs.readdirSync('view/TinyIcons')
picData = files.map(item => ('/TinyIcons/' + item))

module.exports.picData = picData