const express = require('express');
const v1Router = express.Router();
const orderRouter = require('./routes/order.routes');

v1Router.use('/orders', orderRouter);

module.exports = v1Router;
