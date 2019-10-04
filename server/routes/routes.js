const express = require('express');

const Route = require('../models/route');
const {
    authenticate
} = require('../middleware/authenticate');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
    try {
        const routes = await Route.find({});

        res.json({
            type: false,
            title: 'OK',
            detail: 'Routes found successfully!',
            routes,
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
