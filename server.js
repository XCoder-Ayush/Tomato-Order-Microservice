const express = require('express')
const app = express()
const cors=require('cors');
const bodyParser = require('body-parser');
app.use(cors());
app.use(express.json())
const PORT = process.env.PORT || 8081

// app.use(express.static('public'))

const connectToDB = require('./db')
const Order = require('./models/order')
const OrderItem = require('./models/orderitem')

connectToDB()

// Routes / Apis
app.use(bodyParser.json());

app.post('/api/orders', async (req, res) => {
    try {
        console.log(req.body);

        // Create OrderItem documents for each item
        const items=JSON.parse(req.body.items);
        const orderItems = items.map(item => new OrderItem(item));
        const savedOrderItems = await Promise.all(orderItems.map(item => item.save()));

        // Get the _id values of the saved OrderItem documents
        const orderItemIds = savedOrderItems.map(item => item._id);

        // Create the Order document with the obtained OrderItem _id values
        const order = new Order({
            orderId: req.body.orderId,
            paymentType: req.body.paymentType,
            userId: req.body.userId,
            amount: req.body.totalAmt,
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

app.get('/',(req,res)=>{
    res.send("Hello From Server")
})

app.get('/api/orders', (req, res) => {
    Order.find().then((orders)=> {
        res.send(orders)
    })
})

const server = app.listen(PORT, () => {
    console.log(`Listening On Port ${PORT}`)
})

let io = require('socket.io')(server,{
    cors: {
      origin: 'http://localhost:4200',
      methods: ['GET', 'POST'],
    },
  })

var adminRoom="";
io.on('connection', (socket) => {
    console.log(`New Connection: ${socket.id}`)
    const userRole = socket.handshake.query.userRole;
    console.log(`${userRole}`);
    if(userRole=='ADMIN'){
        adminRoom=socket.id;
        console.log(adminRoom);
    }  
    socket.on('send-message',(order,room)=>{
        console.log(order);
        console.log(room);
        console.log(adminRoom);
        io.to(adminRoom).emit('dataFromServer',order);
        // socket.to(room).emit('dataFromServer',order);
    })

    socket.on('userToServer',(order,room)=>{
        console.log(order);
        console.log(room);
        console.log(adminRoom);
        io.to(adminRoom).emit('dataFromServer',order);
    })
    socket.on('adminToServer',(order,room)=>{
        console.log(order);
        console.log(room);
        console.log(adminRoom);
        io.to(adminRoom).emit('dataFromServer',order);
    })
    
      socket.on('disconnect', () => {
        console.log('A User Disconnected');
      });
})
