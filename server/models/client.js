const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const ClientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false,
        trim: true,
        unique: false,
    },
    uniqueNumber: {
        type: String,
        required: false,
        trim: true,
        unique: false,
    },
    birthDate: {
        type: Date,
        required: false,
        trim: true,
        unique: false,
    },
    email: {
        type: String,
        required: false,
        minlength: 1,
        trim: true,
        unique: false,
    },
});

ClientSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Client', ClientSchema);