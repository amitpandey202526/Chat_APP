exports.socketHandler = (io) => {
  global.io = io;

  io.on('connection', (socket) => {
    console.log('Socket Connected');

   // user joining their personal room for direct messages and notifications
    socket.on('user:join', (userId) => {
      const room = `user:${String(userId)}`;
      socket.join(room);
      console.log(`User ${userId} joined room ${room}`);
    });
// admin joining a common room for admin notifications 

    socket.on('admin:join', () => {
      socket.join('admins');
      console.log('Admin joined admins room');
      
    });

    socket.on('disconnect', () => {
      console.log('Disconnected');
    });
  });
};