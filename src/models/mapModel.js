const mongoose = require('mongoose');
const {Schema} = mongoose;

const mapSchema = new mongoose.Schema({
    data:{
        type:mongoose.Schema.Types.Mixed
    }
},{timestamps:true});

module.exports = mongoose.model('mapData',mapSchema);