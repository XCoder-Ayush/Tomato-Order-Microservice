class OrderDto{
    constructor(orderId, paymentType,userId,userName,status,address,phone,items){
        this.orderId=orderId;
        this.paymentType=paymentType;
        this.userId=userId;
        this.userName=userName;
        this.status=status;
        this.address=address;
        this.phone=phone;
        this.items=items;
    }
}

module.exports=OrderDto;
