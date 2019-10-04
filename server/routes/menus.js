const express = require('express');

const Menu = require('../models/menu');
const Session = require('../models/session');
const User = require('../models/user');
const Role = require('../models/role');
const {
    authenticate
} = require('../middleware/authenticate');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
    try {
        const session = await Session.findOne({ token: req.headers.token });
        const userId = session.userId;
        const user = await User.findById(userId);
        const role = await Role.findById(user.role);
        const menus = await Menu.find({ _id: role.menus });

        res.json({
            type: false,
            title: 'OK',
            detail: 'Menus loaded successfully!',
            menus,
        });
    } catch (err) {
        res.status(401).json({
            errors: [{
                type: 'error',
                title: 'ERRO',
                detail: 'Unexpected error. Please contact the administrator.',
                errorMessage: err.message,
            }, ],
        });
    }
});

module.exports = router;
