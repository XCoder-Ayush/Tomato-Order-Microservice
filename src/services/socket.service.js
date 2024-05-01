class SocketService {
  constructor(io) {
    this.io = io;
  }

  initializeSocket() {
    this.io.on('connection', (socket) => {
      console.log(`New Connection: ${socket.id}`);

      socket.on('place-order', (data) => {
        console.log('In Socket**********************');
        this.io.emit('place-order', data);
      });

      socket.on('join-order-room', (orderId) => {
        socket.join(orderId);
        console.log(orderId);
        socket.on('order-status', (orderId, newStatus) => {
          console.log(newStatus);
          const clientId = this.getTargetClientId(orderId, socket.id);
          if (clientId != null) {
            console.log(clientId, socket.id);
            socket.to(clientId).emit('order-status', { orderId, newStatus });
          }
        });

        socket.on('disconnect', () => {
          socket.leave(orderId);
          console.log(`User left room: ${orderId}`);
        });
      });

      socket.on('disconnect', () => {
        console.log('A User Disconnected');
      });
    });
  }

  getTargetClientId(roomId, userId) {
    console.log('Inside Function *************************************');
    console.log(roomId);
    console.log(userId);
    const socketsInRoom = this.io.of('/').adapter.rooms.get(roomId);
    console.log(socketsInRoom);

    for (const socketId of socketsInRoom) {
      if (socketId !== userId) {
        return socketId;
      }
    }
    return null;
  }
}

module.exports = SocketService;
