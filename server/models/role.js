const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema

const RoleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false,
        trim: true,
        unique: false,
    },
    routes: [{
        type: Schema.Types.ObjectId,
        ref: 'Route'
    }],
    menus: [{
        type: Schema.Types.ObjectId,
        ref: 'Menu'
    }],
    users: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
});

RoleSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Role', RoleSchema);