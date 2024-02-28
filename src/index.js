const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
// const dotenv = require('dotenv').config();
// const {MONGODB_URI} = process.env;

const route = require('./route/route');
// const scheduledAPI = require('./route/automatic-api');
const mongoose = require('mongoose');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb+srv://chaudharyaditya41:Z67gI1uJnrGCnHuY@cluster0.jgngtnq.mongodb.net/testingAPIsDb7?retryWrites=true&w=majority', {
    usenewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("MongoDB is connected"))
    .catch(err => console.log(err))


app.use('/', route);
// app.use('/automatic-api',scheduledAPI);

app.get('/',(req,res)=>{
    res.send("Working")
})

app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on Port', (process.env.PORT || 3000))
});