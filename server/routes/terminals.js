const express = require('express');

const Terminal = require('../models/terminal');
const {
    authenticate
} = require('../middleware/authenticate');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
    try {
        const terminals = await Terminal.find({});

        res.json({
            type: 'success',
            title: 'OK',
            detail: 'Terminals found successfully!',
            terminals,
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

router.get('/:id', authenticate, async (req, res) => {
    try {
        const terminal = await Terminal.findById(req.params.id).populate('orders');

        res.json({
            type: 'success',
            title: 'OK',
            detail: 'Terminal found successfully.',
            terminal,
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
