const express = require('express');

const Product = require('../models/product');
const Ticket = require('../models/ticket');
const Cashier = require('../models/cashier');
const {
    authenticate
} = require('../middleware/authenticate');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
    try {
        const products = await Product.find({}).populate('terminal');

        res.json({
            type: 'success',
            title: 'OK',
            detail: 'Produtos encontrados com sucesso!',
            products,
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
        const product = await Product.findById(req.params.id);

        res.json({
            type: false,
            title: 'OK',
            detail: 'Produto encontrado com sucesso!',
            product,
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
        const product = new Product(req.body);
        const allProducts = await Product.find({}).select('uniqueCode -_id');
        let uniqueCodes = [];
        let allUniqueCodes = Array.from(Array(9999).keys());

        allProducts.map(product => {
            uniqueCodes.push(product.uniqueCode);
        });

        Array.prototype.diff = function (a) {
            return this.filter(function (i) {
                return a.indexOf(i) < 0;
            });
        };

        let uniqueCodesToUse = allUniqueCodes.diff(uniqueCodes);

        if (!req.body.uniqueCode || req.body.uniqueCode === '' || req.body.uniqueCode === null) {
            product.uniqueCode = uniqueCodesToUse[0];
        }

        const persistedProduct = await product.save();

        res
            .status(201)
            .json({
                type: 'success',
                title: 'OK',
                detail: 'Produto cadastrado com sucesso!',
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

router.put('/:id', authenticate, async (req, res) => {
    try {
        const {
            name,
            barCode,
            quantity,
            price,
            uniqueCode,
            terminal,
        } = req.body;

        const product = {
            name: name,
            barCode: barCode,
            quantity: quantity,
            price: price,
            uniqueCode: uniqueCode,
            terminal: terminal,
        };

        let persistedProduct = await Product.findByIdAndUpdate(req.params.id, product);

        res
            .status(201)
            .json({
                type: 'success',
                title: 'OK',
                detail: 'Produto alterado com sucesso!',
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


router.delete('/:id', authenticate, async (req, res) => {
    try {
        const products = await Product.findByIdAndDelete({
            _id: req.params.id
        });

        res.json({
            type: 'success',
            title: 'OK',
            detail: 'Produto excluído com sucesso!',
            products,
        });
    } catch (err) {
        res.status(401).json({
            errors: [{
                type: 'error',
                title: 'Erro',
                detail: 'Erro inesperado. Contate o administrador do sistema.',
                errorMessage: err.message,
            }, ],
        });
    }
});

router.post('/search', authenticate, async (req, res) => {
    try {
        let products = [];
        const {
            name,
            code
        } = req.body;

        if (name && name !== "") {
            products = await Product.find({
                name: {
                    "$regex": name,
                    "$options": "i"
                }
            });
        }

        if (code && code !== "") {
            if (code.length > 4) {
                products = await Product.find({
                    barCode: code
                });
            } else {
                products = await Product.find({
                    uniqueCode: code
                });
            }
        }

        res.json({
            type: false,
            title: 'OK',
            detail: 'Produtos encontrados com sucesso!',
            products,
        });
    } catch (err) {
        res.status(401).json({
            errors: [{
                type: 'error',
                title: 'Erro',
                detail: 'Erro inesperado. Contate o administrador do sistema.',
                errorMessage: err.message,
            }, ],
        });
    }
});

router.post('/pay', authenticate, async (req, res) => {
    try {
        const {
            ticketId,
            cashierId,
            productsIds
        } = req.body;
        const ticket = await Ticket.findById(ticketId);
        const cashier = await Cashier.findById(cashierId);

        await productsIds.reduce(async (previousPromise, nextId) => {
            await previousPromise;
            let product = await Product.findById(nextId);

            let index = ticket.products.indexOf(product._id)
            ticket.products.splice(index, 1);
            ticket.totalPrice -= product.price;

            product.quantity--;

            if (product.cashiers.indexOf(cashier._id) === -1) {
                product.cashiers.push(cashier._id);
            }

            cashier.products.push(product._id);
            cashier.price += product.price;

            return await product.save();
        }, Promise.resolve());

        await cashier.save();
        const persistedTicket = await ticket.save();

        res.json({
            type: 'success',
            title: 'OK',
            detail: 'Produto(s) pago(s) com sucesso (com baixa de estoque)!',
            persistedTicket,
        });

    } catch (err) {
        res.status(401).json({
            errors: [{
                type: 'error',
                title: 'Erro',
                detail: 'Erro inesperado. Contate o administrador do sistema.',
                errorMessage: err.message,
            }, ],
        });
    }
});

router.post('/pay/cashier', authenticate, async (req, res) => {
    try {
        const {
            cashierId,
            productsIds
        } = req.body;
        const cashier = await Cashier.findById(cashierId);

        await productsIds.reduce(async (previousPromise, nextId) => {
            await previousPromise;
            let product = await Product.findById(nextId);

            product.quantity--;

            if (product.cashiers.indexOf(cashier._id) === -1) {
                product.cashiers.push(cashier._id);
            }

            cashier.products.push(product._id);
            cashier.price += product.price;

            return await product.save();
        }, Promise.resolve());

        const persistedCashier = await cashier.save();

        res.json({
            type: 'success',
            title: 'OK',
            detail: 'Venda realizada com sucesso (com baixa de estoque)!',
            persistedCashier,
        });

    } catch (err) {
        res.status(401).json({
            errors: [{
                type: 'error',
                title: 'Erro',
                detail: 'Erro inesperado. Contate o administrador do sistema.',
                errorMessage: err.message,
            }, ],
        });
    }
});

router.post('/remove', authenticate, async (req, res) => {
    try {
        const {
            ticketId,
            productsIds
        } = req.body;
        const ticket = await Ticket.findById(ticketId);

        await productsIds.reduce(async (previousPromise, nextId) => {
            await previousPromise;
            let product = await Product.findById(nextId);

            let index = ticket.products.indexOf(nextId);
            ticket.products.splice(index, 1);
            ticket.totalPrice -= product.price;

            return await product;
        }, Promise.resolve());

        const persistedTicket = await ticket.save();

        res.json({
            type: 'success',
            title: 'OK',
            detail: 'Produto(s) removido(s) da comanda (sem baixa de estoque)!',
            persistedTicket,
        });

    } catch (err) {
        res.status(401).json({
            errors: [{
                type: 'error',
                title: 'Erro',
                detail: 'Erro inesperado. Contate o administrador do sistema.',
                errorMessage: err.message,
            }, ],
        });
    }
});

router.post('/remove-from-stock', authenticate, async (req, res) => {
    try {
        const {
            ticketId,
            productsIds
        } = req.body;
        const ticket = await Ticket.findById(ticketId);

        await productsIds.reduce(async (previousPromise, nextId) => {
            await previousPromise;
            let product = await Product.findById(nextId);

            product.quantity--;

            let index = ticket.products.indexOf(nextId);
            ticket.products.splice(index, 1);
            ticket.totalPrice -= product.price;

            return await product;
        }, Promise.resolve());

        const persistedTicket = await ticket.save();

        res.json({
            type: 'success',
            title: 'OK',
            detail: 'Baixa de estoque do(s) produto(s) concluída!',
            persistedTicket,
        });

    } catch (err) {
        res.status(401).json({
            errors: [{
                type: 'error',
                title: 'Erro',
                detail: 'Erro inesperado. Contate o administrador do sistema.',
                errorMessage: err.message,
            }, ],
        });
    }
});


module.exports = router;