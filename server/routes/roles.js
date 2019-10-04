const express = require('express');

const Role = require('../models/role');
const {
    authenticate
} = require('../middleware/authenticate');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
    try {
        const roles = await Role.find({});

        res.json({
            type: false,
            title: 'OK',
            detail: 'Perfis encontrados com sucesso!',
            roles,
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