const mongoose = require('mongoose')

const Schema = mongoose.Schema

const orderSchema = new Schema({
    orderId: {
        type: String, 
        required: true, 
        unique: true
    },
    paymentType: { type: String, required: true },
    userId: { type: String, required: true },
    amount: { type: Number, require: true },
    status: { type: String, require: true },    
    address: { type: String, require: true },    
    phone: { type: String, require: true },
    items : [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'OrderItem'
        }
    ]
    
}, { timestamps: true })

const Order = mongoose.model('Order', orderSchema)

module.exports = Order