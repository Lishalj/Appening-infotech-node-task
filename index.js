
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
mongoose.set('strictQuery', true)

//body-parser middleware
app.use(bodyParser.json());

//enable cors
app.use(cors());

//import routes
const usersRoute = require('./routes/users');

//routes middleware
app.use('/api/users', usersRoute);

//connect to DB
mongoose.connect('mongodb://localhost:27017/lisha-jonwal-nodejs-auth', {
    useNewUrlParser: true, 
    useUnifiedTopology: true}, (err) => {
        if(err){
            console.log(err)
        }
        console.log('Connected to DB!')
    }
);

//listen on port
const port = process.env.PORT || 5000;
app.listen(port, (err) => {
    if(err){
        console.log(err);
    }
    console.log(`Server is running on port ${port}`)
});
