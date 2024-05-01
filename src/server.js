const ServerConfig = require('./config/server.config');
const PORT = ServerConfig.PORT || 9090;
const SocketService = require('./services/socket.service');
const connectToMongoInstance = require('./config/db.config');
// const Order = require('./models/order.model');
// const OrderItem = require('./models/orderitem.model');
const app = require('./app');

connectToMongoInstance()
  .then(() => {
    app.on('error', (error) => {
      console.error(error);
      throw error;
    });

    const server = app.listen(PORT, () => {
      console.log(`Server Started At ${PORT}`);
    });

    // Create socket instance
    let io = require('socket.io')(server, {
      cors: {
        origin: ['http://localhost:4200', 'http://localhost:3000'],
        methods: ['GET', 'POST'],
      },
    });

    let socketService = new SocketService(io);
    socketService.initializeSocket();
  })
  .catch((err) => {
    console.log('DB Connection Failed ', err);
  });

// let adminRoom = '';
// io.on('connection', (socket) => {
//   // when a frontend client connects, connection event is fired

//   // socket->all info about the client, not server
//   console.log(`New Connection: ${socket.id}`);
//   //   const userRole = socket.handshake.query.userRole;
//   //   if (userRole == 'ADMIN') {
//   //     adminRoom = socket.id;
//   //   }

//   //   on this event, client joins the room with roomId=orderId:
//   socket.on('place-order', (data) => {
//     console.log('In Socket**********************');
//     io.emit('place-order', data);
//   });

//   socket.on('join-order-room', (orderId) => {
//     socket.join(orderId);
//     console.log(orderId);
//     socket.on('order-status', (orderId, newStatus) => {
//       console.log(newStatus);
//       // Before emitting get target client id
//       const clientId = getTargetClientId(orderId, socket.id);
//       if (clientId != null) {
//         // io.to(orderId).emit('order-status', { orderId, newStatus });
//         console.log(clientId, socket.id);
//         socket.to(clientId).emit('order-status', { orderId, newStatus });
//       }
//     });

//     socket.on('disconnect', () => {
//       socket.leave(orderId);
//       console.log(`User left room: ${orderId}`);
//     });
//   });

//   socket.on('disconnect', () => {
//     console.log('A User Disconnected');
//   });
// });

// function getTargetClientId(roomId, userId) {
//   console.log('Inside Function *************************************');
//   console.log(roomId);
//   console.log(userId);
//   // map<string,set<string>>
//   const socketsInRoom = io.of('/').adapter.rooms.get(roomId);
//   console.log(socketsInRoom);

//   for (const socketId of socketsInRoom) {
//     if (socketId !== userId) {
//       return socketId;
//     }
//   }
//   return null; // User not found
// }
