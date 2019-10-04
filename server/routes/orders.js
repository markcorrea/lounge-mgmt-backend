const express = require('express');

const Order = require('../models/order');
const {
    authenticate
} = require('../middleware/authenticate');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
    try {
        const orders = await Order.find({}).sort({'created': 1});

        res.json({
            type: false,
            title: 'OK',
            detail: 'Pedidos encontrados com sucesso!',
            orders,
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

router.get('/terminal/:id', authenticate, async (req, res) => {
    try {
        const orders = await Order.find({ terminal: req.params.id, ready: false }).sort({'created': 1});

        res.json({
            type: false,
            title: 'OK',
            detail: 'Pedidos encontrados com sucesso!',
            orders,
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

router.post('/', authenticate, async (req, res) => {
    try {
        const order = new Order(req.body);
        const persistedOrder = await order.save();

        res.json({
            type: 'success',
            title: 'OK',
            detail: 'Pedido criado com sucesso!',
            persistedOrder,
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

router.post('/ready/:id', authenticate, async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete({
            _id: req.params.id
        });

        var io = req.app.get('socketio');
        io.emit('orderReady', order);

        res.json({
            type: false,
            title: 'OK',
            detail: 'Pedido pronto!',
            order,
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