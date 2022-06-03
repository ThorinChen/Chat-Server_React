var express = require('express');
var mutipart = require('connect-multiparty');
var path = require('path');
var fs = require('fs');
var app = express();
var { picData } = require('./data/picData.js')
require('./services/websocket.js');

var mutipartMiddeware = mutipart();
app.use(mutipart({ uploadDir: './upload' }));


app.set('port', process.env.PORT || 4000);
app.listen(app.get('port'), function () {
    console.log("express started on http://localhost:" + app.get('port') + '.');
});


var fileArr = [];

// 首页
app.get('/', function (req, res) {
    res.type('text/html');
    res.sendfile('view/index.html')

});

app.use(express.static(path.join(__dirname, 'view')))
app.use(express.static(path.join(__dirname, 'upload')))

// 跨域
app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
})

// 中间件处理form文件
app.post('/upload', mutipartMiddeware, function (req, res) {
    console.log(req.files);

    if (Object.keys(req.files).length === 0) {
        res.send({
            code: -1,
            data: {},
            msg: 'upload file error'
        })
        return;
    }
    var now = new Date().getTime();
    req.files.createTime = now;
    req.files.id = fileArr.length;
    fileArr.push(req.files)

    //返回成功
    res.send({
        code: 0,
        data: {
            filename: req.files.myfile.originalFilename,
            path: req.files.myfile.path,
            size: req.files.myfile.size
        },
        msg: 'upload success!'
    });
});

app.get('/files', function (req, res) {

    var result = [];

    fileArr.forEach((item) => {
        !item.isDelete && result.push(item)
    })
    res.send({
        code: 0,
        data: {
            fileArr: result
        },
        msg: 'file success!'
    })
})

app.get('/download', function (req, res) {
    var file = req.query.file,
        name = req.query.name,
        currFile = path.join(__dirname, file),
        fReadStream;
    fs.exists(currFile, function (exist) {
        if (exist) {
            res.set({
                "Content-type": "application/octet-stream",
                "Content-Disposition": "attachment;filename=" + encodeURI(name)
            });
            fReadStream = fs.createReadStream(currFile);
            fReadStream.on("data", (chunk) => res.write(chunk, "binary"));
            fReadStream.on("end", function () {
                res.end();
            });
        } else {
            res.set("Content-type", "text/html");
            res.send("file not exist!");
            res.end();
        }
    });
});

app.use('/delete', function (req, res) {
    var key = req.query.key

    if (fileArr[key]) {
        fileArr[key].isDelete = true;
        fileArr[key].deleteTime = new Date().getTime();

        res.send({
            code: 0,
            data: {},
            msg: 'delete success!'
        })
    } else {
        res.send({
            code: -1,
            data: {},
            msg: 'file not exist!'
        })
    }
})

app.use('/deleted', function (req, res) {
    var result = [];

    fileArr.forEach((item) => {
        item.isDelete && result.push(item)
    })
    res.send({
        code: 0,
        data: {
            fileArr: result
        },
        msg: 'deleted files success!'
    })
})

app.use('/rollback', function (req, res) {
    var key = req.query.key

    if (fileArr[key]) {
        fileArr[key].isDelete = false;
        fileArr[key].rollback = new Date().getTime();

        res.send({
            code: 0,
            data: {},
            msg: 'rollback success!'
        })
    } else {
        res.send({
            code: -1,
            data: {},
            msg: 'file not exist!'
        })
    }
})


app.get('/avatars', function (req, res) {
    res.send({
        code: 0,
        data: {
            list: picData
        },
        msg: 'success'
    })
})
