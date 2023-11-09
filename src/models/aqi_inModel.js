const mongoose = require('mongoose');
const {Schema} = mongoose;

const aqiSchema = new mongoose.Schema({
    SerialNo: {
        type: Number
    },
    location: {
        type: String
    },
    City: {
        type: String
    },
    State: {
        type: String
    },
    Country: {
        type: String
    },
    AQI_IN: {
        type: mongoose.Schema.Types.Mixed
    },
    PM25: {
        type: Number
    },
    PM10: {
        type: Number
    },
    Temp: {
        type: Number
    },
    Humidity: {
        type: Number
    },
    Time:{
        type: Date
    }
},{timestamps:true});

module.exports = mongoose.model('AQI', aqiSchema);