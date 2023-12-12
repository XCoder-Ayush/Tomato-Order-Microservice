function connectToDB() {
    // This code is entirely responsible for making connection to database
    const mongoose = require('mongoose')
    const URL = `mongodb://localhost:27017/tomato`

    mongoose.connect(URL, {
        useUnifiedTopology: true,
        useNewUrlParser:true
    })

    const connection = mongoose.connection
    connection.once('open', ()=> {
        console.log('Connected To Database...')
    }).on('error', function (err) {
        console.log(err);
    })
}

module.exports = connectToDB