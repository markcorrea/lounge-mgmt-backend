const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema

const MenuSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
        trim: true,
        unique: false,
    },
    icon: {
        type: String,
        required: true,
        trim: true,
        unique: false,
    },
    title: {
        type: String,
        required: true,
        trim: true,
        unique: false,
    },
    roles: [{
        type: Schema.Types.ObjectId,
        ref: 'Role'
    }],
});

MenuSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Menu', MenuSchema);