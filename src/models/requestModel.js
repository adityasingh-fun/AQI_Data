const mongoose = require('mongoose');
const { Schema } = mongoose;

const requestSchema = new mongoose.Schema({
    status: String,
    data: {
        aqi: Number,
        idx: Number,
        attributions: [mongoose.Schema.Types.Mixed],
        city: {
            geo: [mongoose.Schema.Types.Mixed],
            name: String,
            url: String,
            location: String,
        },
        dominentpol: String,
        iaqi: mongoose.Schema.Types.Mixed,
        time: {
            s: String,
            tz: String,
            v: Number,
            iso: String,
        },
        forecast: { daily: mongoose.Schema.Types.Mixed },
        debug: { sync: String },
    }
}, { timestamps: true });

module.exports = mongoose.model("requestData", requestSchema);