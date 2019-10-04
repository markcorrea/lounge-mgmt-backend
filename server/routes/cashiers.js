const express = require('express');

const Cashier = require('../models/cashier');
const Product = require('../models/product');
const Session = require('../models/session');
const User = require('../models/user');
const {
    authenticate
} = require('../middleware/authenticate');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
    try {
        const cashiers = await Cashier.find({}).sort({'openDate': -1});

        res.json({
            type: false,
            title: 'OK',
            detail: 'Caixas encontrados com sucesso!',
            cashiers,
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
        const cashier = await Cashier.findById(req.params.id).populate('products');

        res.json({
            type: false,
            title: 'OK',
            detail: 'Caixa encontrado com sucesso!',
            cashier,
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
        const cashier = new Cashier(req.body);
        const session = await Session.findOne({
            token: req.headers.token
        });
        const userId = session.userId;
        const user = await User.findById(userId);
        console.log(user);
        cashier.name = user.name;
        const persistedCashier = await cashier.save();

        res.json({
            type: 'success',
            title: 'OK',
            detail: 'Caixa criado com sucesso',
            persistedCashier,
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

router.post('/close/:id', authenticate, async (req, res) => {
    try {
        const cashier = await Cashier.findById(req.params.id);
        cashier.closeDate = Date.now();

        const persistedCashier = await cashier.save();

        res.json({
            type: 'success',
            title: 'OK',
            detail: 'Caixa fechado com sucesso',
            persistedCashier,
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

router.post('/:cashierId/pay/:productId', authenticate, async (req, res) => {
    try {
        const cashier = await Cashier.findById(req.params.cashierId);
        const product = await Product.findById(req.params.productId);
        cashier.price += product.price;
        cashier.products.push(product._id);
        product.quantity--;
        if (product.cashiers.indexOf(cashier._id) === -1) {
            product.cashiers.push(cashier._id);
        }
        const persistedCashier = await cashier.save();
        const persistedProduct = await product.save();

        res
            .status(201)
            .json({
                type: 'success',
                title: 'OK',
                detail: 'Valor pago com sucesso',
                persistedCashier,
                persistedProduct
            });
    } catch (err) {
        res.status(400).json({
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