const mongoose = require('mongoose');
const {Schema} = mongoose;

const aqiSchema = new mongoose.Schema({
    Uid: {
        type: Number
    },
    LocationName: {
        type: String
    },
    AQI: {
        type: mongoose.Schema.Types.Mixed
    },
    DominentPollutent: {
        type: mongoose.Schema.Types.Mixed
    },
    PM10: {
        type: mongoose.Schema.Types.Mixed
    },
    PM25: {
        type: mongoose.Schema.Types.Mixed
    },
    Temperartue: {
        type: mongoose.Schema.Types.Mixed
    },
    Humidity: {
        type: mongoose.Schema.Types.Mixed
    },
    StationName: {
        type: String
    },
    CityName: {
        type: String
    },
    StateName: {
        type: String
    },
    Country: {
        type: String
    },
    latitude: {
        type: Number
    },
    longitude: {
        type: Number
    }
},{timestamps:true});

module.exports = mongoose.model('AQI', aqiSchema);