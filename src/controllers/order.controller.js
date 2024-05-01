const Order = require('../models/order.model');
const OrderItem = require('../models/orderitem.model');

const HealthCheck = (req, res) => {
  res.send('Hello From Server');
};

const SaveOrder = async (req, res) => {
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
};

const GetOrderById = async (req, res) => {
  const orderId = req.params.id; // String

  try {
    const order = await Order.findOne({ orderId: orderId });

    if (!order) {
      return res.status(404).json({ error: `Order Not Found` });
    }

    let orderData = {
      orderId: order.orderId,
      userName: order.userName,
      userId: order.userId,
      amount: order.amount,
      paymentType: order.paymentType,
      status: order.status,
      address: order.address,
      phone: order.phone,
      items: [],
    };

    await Promise.all(
      order.items.map(async (item) => {
        const orderItem = await OrderItem.findById(item);

        let orderItemData = {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          subtotal: orderItem.subtotal,
        };

        orderData.items.push(orderItemData);
      })
    );

    res.json(orderData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const GetAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    let orderList = [];

    await Promise.all(
      orders.map(async (order) => {
        let orderData = {
          orderId: order.orderId,
          userName: order.userName,
          userId: order.userId,
          paymentType: order.paymentType,
          amount: order.amount,
          status: order.status,
          address: order.address,
          phone: order.phone,
          items: [],
        };

        await Promise.all(
          order.items.map(async (item) => {
            const orderItem = await OrderItem.findById(item);

            let orderItemData = {
              id: orderItem.id,
              name: orderItem.name,
              price: orderItem.price,
              quantity: orderItem.quantity,
              subtotal: orderItem.subtotal,
            };

            orderData.items.push(orderItemData);
          })
        );

        orderList.push(orderData);
      })
    );

    res.json(orderList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const UpdateOrder = async (req, res) => {
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
};

module.exports = {
  HealthCheck,
  SaveOrder,
  GetOrderById,
  GetAllOrders,
  UpdateOrder,
};
