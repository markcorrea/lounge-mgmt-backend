const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema

const TerminalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false,
        trim: true,
        unique: false,
    },
    uniqueCode: {
        type: Number,
        required: false,
        trim: true,
        unique: true,
    },
    orders: [{
        type: Schema.Types.ObjectId,
        ref: 'Order'
    }],
});

TerminalSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Terminal', TerminalSchema);