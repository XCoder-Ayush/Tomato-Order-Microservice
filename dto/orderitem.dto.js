class OrderItemDto {
    constructor(name, id, price, quantity, subtotal) {
        this.name = name;
        this.id = id;
        this.price = price;
        this.quantity = quantity;
        this.subtotal=subtotal;
    }
}

module.exports=OrderItemDto