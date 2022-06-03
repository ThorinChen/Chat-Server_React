var io = require('socket.io')(2000);
var { picData } = require('../data/picData.js')
var users = {};
console.log('socket.io started on http://localhost:2000.')

io.on('connection', function (socket) {
  var addedUser = false;

  socket.emit('news', { hi: 'hi! welcome' });

  socket.on('addUser', function(data) {

    if (addedUser) return;

    addedUser = true;
    var now = new Date().getTime();
    var user = {};
    user.connectTime = now;
    if(data.myId){
      user.id = users[data.myId] && !users[data.myId].isLeave ? createID() : data.myId;
    }else{
      user.id = createID()
    }
    user.myName = data.myId && (user.id === data.myId) ? data.myName : user.id;
    user.avatar = data.myId && (user.id === data.myId) ? data.avatar : picData[0];
    user.socketId = socket.id;
    users[user.id] = user;
    socket.userId = user.id;
    console.log(users)
    socket.emit('addUser', { user: user });
    socket.emit('users', {target: '*', msg: users})
    socket.broadcast.emit('users', {target: '*', msg: users})
  })

  socket.on('chat', function (data) {
    console.log(data);
    socket.broadcast.emit('chat', {
      from: data.myId,
      hisName: data.myName,
      type: data.type,
      msg: data.msg,
      sendTime: data.sendTime,
      avatar: data.avatar,
      target: data.target
    })
    socket.emit('return', {
      msg: 'success',
      ack: data.target + '_' + data.sendTime
    })
    // users[socket.userId].connectTime = new Date().getTime()
  });

  socket.on('editUser', function(data){
	  !users[data.myId] && (users[data.myId] = {})
    if(data.myName) {
      console.log(data.myId + 'change name to' + data.myName)
      if(users[data.myId]) users[data.myId].myName = data.myName;
    }

    if(data.avatar) {
      console.log(data.myId + 'change avatar to' + data.avatar)
      if(users[data.myId]) users[data.myId].avatar = data.avatar;
    }
    // users[socket.userId].connectTime = new Date().getTime()
    socket.emit('users', {target: '*', msg: users})
    socket.broadcast.emit('users', {target: '*', msg: users})
  })

  socket.on('disconnect', () => {
    if (addedUser) {
      
      users[socket.userId].isLeave = true;
      users[socket.userId].connectTime = new Date().getTime()
      console.log(users[socket.userId].myName + ' 离开了')
      // echo globally that this client has left
      socket.broadcast.emit('users', {target: '*', msg: users})
    }
  });

});

function createID() {
  var id = parseInt(10000 + Math.random() * 100000 % 89999);
  if(users[id] && !user[id].isLeave){
    return createID(id)
  }else{
    return id
  }
}

