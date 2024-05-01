const express = require('express');
const orderRouter = express.Router();
const OrderController = require('../../../controllers/order.controller');
// const AuthMiddleware = require('../../../middlewares/auth.middleware');

orderRouter.route('/').post(OrderController.SaveOrder);
orderRouter.route('/:id').get(OrderController.GetOrderById);
orderRouter.route('/').get(OrderController.GetAllOrders);
orderRouter.route('/status').post(OrderController.UpdateOrder);

module.exports = orderRouter;
