const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 8081;

// app.use(express.static('public'))

const connectToDB = require('./db');
const Order = require('./models/order');
const OrderItem = require('./models/orderitem');
const OrderDto = require('./dto/order.dto');
const OrderItemDto = require('./dto/orderitem.dto');
connectToDB();

// Routes / Apis
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello From Server');
});

app.post('/api/orders', async (req, res) => {
  try {
    console.log(req.body);

    // Create OrderItem documents for each item
    const items = req.body.items;
    const orderItems = items.map((item) => new OrderItem(item));

    // Saving Each Order Item In DB

    const savedOrderItems = await Promise.all(
      orderItems.map((item) => item.save())
    );

    // Get the _id values of the saved OrderItem documents
    const orderItemIds = savedOrderItems.map((item) => item._id);

    // Create the Order document with the obtained OrderItem _id values
    const order = new Order({
      orderId: req.body.orderId,
      paymentType: req.body.paymentType,
      userId: req.body.userId,
      userName: req.body.userName,
      amount: req.body.amount,
      status: req.body.status,
      address: req.body.address,
      phone: req.body.phone,
      items: orderItemIds,
    });

    // Save the Order document
    const savedOrder = await order.save();

    res.json(savedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  const orderId = req.params.id; //String

  try {
    const order = await Order.findOne({ orderId: orderId });

    if (!order) {
      return res.status(404).json({ error: `Order Not Found` });
    }

    let orderDto = new OrderDto();
    orderDto['orderId'] = order.orderId;
    orderDto['userName'] = order.userName;
    orderDto['userId'] = order.userId;
    orderDto['amount'] = order.amount;
    orderDto['paymentType'] = order.paymentType;
    orderDto['status'] = order.status;
    orderDto['address'] = order.address;
    orderDto['phone'] = order.phone;
    orderDto['items'] = [];

    await Promise.all(
      order.items.map(async (item) => {
        const resp = await OrderItem.findById(item);

        let orderItemDto = new OrderItemDto();
        orderItemDto['id'] = resp.id;
        orderItemDto['name'] = resp.name;
        orderItemDto['price'] = resp.price;
        orderItemDto['quantity'] = resp.quantity;
        orderItemDto['subtotal'] = resp.subtotal;
        console.log(orderItemDto);
        orderDto['items'].push(orderItemDto);
      })
    );

    res.json(orderDto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/orders', async (req, res) => {
  const orders = await Order.find();
  let orderList = [];
  await Promise.all(
    orders.map(async (order) => {
      let orderDto = new OrderDto();
      orderDto['orderId'] = order.orderId;
      orderDto['userName'] = order.userName;
      orderDto['userId'] = order.userId;
      orderDto['paymentType'] = order.paymentType;
      orderDto['amount'] = order.amount;
      orderDto['status'] = order.status;
      orderDto['address'] = order.address;
      orderDto['phone'] = order.phone;
      orderDto['items'] = [];

      await Promise.all(
        order.items.map(async (item) => {
          const resp = await OrderItem.findById(item);

          let orderItemDto = new OrderItemDto();
          orderItemDto['id'] = resp.id;
          orderItemDto['name'] = resp.name;
          orderItemDto['price'] = resp.price;
          orderItemDto['quantity'] = resp.quantity;
          orderItemDto['subtotal'] = resp.subtotal;
          console.log(orderItemDto);
          orderDto['items'].push(orderItemDto);
          // console.log(resp);
        })
      );
      orderList.push(orderDto);
      console.log(orderList);
    })
  );
  // res.json(orders)
  console.log('HERE');
  res.send(orderList);
});

app.post('/api/order/status',async(req,res)=>{
    try {
        const orderId = req.body.orderId;
        const status = req.body.status;

        // Find the order in the database
        const orderInDB = await Order.findOne({ orderId: orderId });

        if (!orderInDB) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Update the status of the order
        await Order.updateOne({ orderId: orderId }, { $set: { status: status } });

        res.json({ success: true, message: 'Order status updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

})

const server = app.listen(PORT, () => {
  console.log(`Listening On Port ${PORT}`);
});

let io = require('socket.io')(server, {
  cors: {
    origin: ['http://localhost:4200','http://localhost:3000'],
    methods: ['GET', 'POST'],
  },
});

let adminRoom = '';
io.on('connection', (socket) => {
// when a frontend client connects, connection event is fired

// socket->all info about the client, not server
  console.log(`New Connection: ${socket.id}`);
//   const userRole = socket.handshake.query.userRole;
//   if (userRole == 'ADMIN') {
//     adminRoom = socket.id;
//   }

//   on this event, client joins the room with roomId=orderId:
  socket.on('place-order',(data)=>{
    console.log('In Socket**********************');
    io.emit('place-order', data );
  })

  socket.on('join-order-room',(orderId)=>{
    socket.join(orderId); 
    console.log(orderId);
    socket.on('order-status', (orderId,newStatus) => {
        console.log(newStatus);
        // Before emitting get target client id
        const clientId = getTargetClientId(orderId,socket.id)
        if(clientId!=null){
            // io.to(orderId).emit('order-status', { orderId, newStatus });
            console.log(clientId,socket.id);
            socket.to(clientId).emit('order-status', { orderId, newStatus });
        }
    });    

    socket.on('disconnect', () => {
        socket.leave(orderId);
        console.log(`User left room: ${orderId}`);
    });
  })

  socket.on('disconnect', () => {
    console.log('A User Disconnected');
  });
});

function getTargetClientId(roomId, userId){
    console.log('Inside Function *************************************');
    console.log(roomId);
    console.log(userId);
    // map<string,set<string>> 
    const socketsInRoom = io.of("/").adapter.rooms.get(roomId)
    console.log(socketsInRoom);

    for (const socketId of socketsInRoom) {
      if (socketId !== userId) {
        return socketId;
      }
    }
    return null; // User not found    
}