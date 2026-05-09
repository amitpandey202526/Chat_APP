exports.socketHandler = (io) => {
  global.io = io;

  io.on('connection', (socket) => {
    console.log('Socket Connected');

    socket.on('user:join', (userId) => {
      const room = `user:${String(userId)}`;
      socket.join(room);
      console.log(`User ${userId} joined room ${room}`);
    });

    socket.on('admin:join', () => {
      socket.join('admins');
      console.log('Admin joined admins room');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected');
    });
  });
};