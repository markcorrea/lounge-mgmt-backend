const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema

const RouteSchema = new mongoose.Schema({
    url: {
        type: String,
        required: false,
        trim: true,
        unique: false,
    },
});

RouteSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Route', RouteSchema);