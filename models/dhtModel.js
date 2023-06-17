const mongoose = require('mongoose');

const dhtModel = new mongoose.Schema({
    temp: {
        type: Number
    },
    hum: {
        type: Number
    },
    weather: {
        type: String
    }
}, { timestamps: true })

module.exports = mongoose.model("dhtModel", dhtModel)