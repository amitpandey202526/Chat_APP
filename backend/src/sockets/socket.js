exports.socketHandler = (io) => {
  global.io = io;

  io.on('connection', (socket) => {
    console.log('Socket Connected');

    socket.on('user:join', (userId) => {
      const room = `user:${String(userId)}`;
      socket.join(room);
    });

    socket.on('admin:join', () => {
      socket.join('admins');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected');
    });
  });
};