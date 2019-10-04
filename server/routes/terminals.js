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
            detail: 'Terminais encontrados com sucesso!',
            terminals,
        });
    } catch (err) {
        res.status(401).json({
            errors: [{
                type: 'error',
                title: 'ERRO',
                detail: 'Erro inesperado. Contate o administrador do sistema.',
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
            detail: 'Terminal encontrado com sucesso.',
            terminal,
        });
    } catch (err) {
        res.status(401).json({
            errors: [{
                type: 'error',
                title: 'ERRO',
                detail: 'Erro inesperado. Contate o administrador do sistema.',
                errorMessage: err.message,
            }, ],
        });
    }
});

module.exports = router;