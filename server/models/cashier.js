const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema

const CashierSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false,
        trim: true,
        unique: false,
    },
    products: [{
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }],
    price: {
        type: Number,
        required: false,
        trim: true,
        unique: false,
        default: 0,
    },
    openDate: {
        type: Date,
        required: true,
        trim: true,
        unique: false,
        default: Date.now
    },
    closeDate: {
        type: Date,
        required: false,
        trim: true,
        unique: false,
    },
});

CashierSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Cashier', CashierSchema);