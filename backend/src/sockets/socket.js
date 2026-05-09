exports.socketHandler = (io) => {
  global.io = io;

  io.on('connection', (socket) => {
    console.log('Socket Connected');

    socket.on('user:join', (userId) => {
      socket.join(userId);
    });

    socket.on('admin:join', () => {
      socket.join('admins');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected');
    });
  });
};