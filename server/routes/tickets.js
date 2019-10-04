const express = require('express');
const Ticket = require('../models/ticket');
const Product = require('../models/product');
const Client = require('../models/client');
const Cashier = require('../models/cashier');
const Order = require('../models/order');
const {
    authenticate
} = require('../middleware/authenticate');
const router = express.Router();

router.get('/', authenticate, async (req, res) => {
    try {
        const tickets = await Ticket.find({}).sort({
            'uniqueNumber': 1
        }).populate('products').populate('client');

        res.json({
            type: false,
            title: 'OK',
            detail: 'Tickets brought successfully!',
            tickets,
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

router.get('/:uniqueNumber', authenticate, async (req, res) => {
    try {
        let ticket = await Ticket.findOne({
            uniqueNumber: req.params.uniqueNumber
        }).populate('products').populate('client');

        let products = []
        ticket.products.map(product => {
            if (!products.some(item => item._id === product._id)) {
                let newProduct = product;
                product.quantity = 1;
                products.push(newProduct)
            } else {
                let arrayProduct = products.find(criteria => criteria._id === product._id)
                let newProduct = {
                    _id: arrayProduct._id,
                    name: arrayProduct.name,
                    barCode: arrayProduct.barCode,
                    quantity: arrayProduct.quantity + 1,
                    price: arrayProduct.price + product.price,
                    uniqueCode: arrayProduct.uniqueCode,
                }

                let newArray = [arrayProduct];
                products = products.filter(item => !newArray.includes(item))

                products.push(newProduct);
            }
        })
        products.sort((a, b) => a.uniqueCode - b.uniqueCode)
        ticket.products = products

        res.json({
            type: false,
            title: 'OK',
            detail: 'Ticket brought successfully!',
            ticket,
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

router.get('/details/:uniqueNumber', authenticate, async (req, res) => {
    try {
        let ticket = await Ticket.findOne({
            uniqueNumber: req.params.uniqueNumber
        }).populate('products').populate('client');

        ticket.products.sort((a, b) => a.uniqueCode - b.uniqueCode)

        res.json({
            type: false,
            title: 'OK',
            detail: 'Ticket brought successfully!',
            ticket,
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

router.post('/', authenticate, async (req, res) => {
    try {
        const ticket = new Ticket(req.body);

        const persistedTicket = await ticket.save();

        res
            .status(201)
            .json({
                type: 'success',
                title: 'OK',
                detail: 'Ticket created successfully!',
                persistedTicket
            });
    } catch (err) {
        res.status(400).json({
            errors: [{
                type: 'error',
                title: 'ERRO',
                detail: 'Unexpected error. Please contact the administrator.',
                errorMessage: err.message,
            }, ],
        });
    }
});

router.post('/move/:uniqueNumber', authenticate, async (req, res) => {
    try {
        let ticket = await Ticket.findOne({
            uniqueNumber: req.params.uniqueNumber
        });

        ticket.uniqueNumber = req.body.uniqueNumber;

        const persistedTicket = await ticket.save();

        res
            .status(201)
            .json({
                type: 'success',
                title: 'OK',
                detail: 'Ticket moved successfully!',
                persistedTicket
            });
    } catch (err) {
        res.status(400).json({
            errors: [{
                type: 'error',
                title: 'ERRO',
                detail: 'Unexpected error. Please contact the administrator.',
                errorMessage: err.message,
            }, ],
        });
    }
});

router.post('/product', authenticate, async (req, res) => {
    try {
        const {
            criteria,
            ticketId,
            isUniqueNumber,
        } = req.body;

        let ticket = await Ticket.findById({
            _id: ticketId
        });
        let product = null;

        if (!isUniqueNumber) {
            product = await Product.findOne({
                _id: criteria
            });
        }

        if (isUniqueNumber) {
            if (criteria.length > 4) {
                product = await Product.findOne({
                    barCode: criteria
                });
            } else {
                product = await Product.findOne({
                    uniqueCode: criteria
                });
            }
        }

        ticket.totalPrice = ticket.totalPrice + product.price;
        ticket.products.push(product);
        let persistedTicket = await ticket.save();
        persistedTicket = await Ticket.findOne({
            _id: persistedTicket._id
        }).populate('products')

        let products = []
        persistedTicket.products.map(product => {
            if (!products.some(item => item._id === product._id)) {
                let newProduct = product;
                product.quantity = 1;
                products.push(newProduct)
            } else {
                let arrayProduct = products.find(criteria => criteria._id === product._id)
                let newProduct = {
                    _id: arrayProduct._id,
                    name: arrayProduct.name,
                    barCode: arrayProduct.barCode,
                    quantity: arrayProduct.quantity + 1,
                    price: arrayProduct.price + product.price,
                    uniqueCode: arrayProduct.uniqueCode,
                }

                let newArray = [arrayProduct];
                products = products.filter(item => !newArray.includes(item))

                products.push(newProduct);
            }
        })
        products.sort((a, b) => a.uniqueCode - b.uniqueCode)
        persistedTicket.products = products

        const order = new Order({
            name: product.name,
            ready: false,
            terminal: product.terminal,
            client: ticket.uniqueNumber
        })
        const persistedOrder = await order.save();

        var io = req.app.get('socketio');
        io.emit(product.terminal, persistedOrder);

        res
            .status(201)
            .json({
                type: 'success',
                title: 'OK',
                detail: 'Product added successfully!',
                persistedTicket
            });
    } catch (err) {
        res.status(400).json({
            errors: [{
                type: 'error',
                title: 'ERRO',
                detail: 'Unexpected error. Please contact the administrator.',
                errorMessage: err.message,
            }, ],
        });
    }
});

router.post('/client', authenticate, async (req, res) => {
    try {
        const {
            criteria,
            ticketId,
        } = req.body;

        let ticket = await Ticket.findById({
            _id: ticketId
        });
        let client = await Client.findOne({
            _id: criteria
        });

        ticket.client = client;
        ticket.name = client.name;

        let persistedTicket = await ticket.save();
        persistedTicket = await Ticket.findOne({
            _id: persistedTicket._id
        }).populate('client')

        res
            .status(201)
            .json({
                type: 'success',
                title: 'OK',
                detail: 'Client added successfully!',
            });
    } catch (err) {
        res.status(400).json({
            errors: [{
                type: 'error',
                title: 'ERRO',
                detail: 'Unexpected error. Please contact the administrator.',
                errorMessage: err.message,
            }, ],
        });
    }
});

router.post('/pay/:id', authenticate, async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        const cashier = await Cashier.findById(req.body.cashierId);

        ticket.totalPrice -= req.body.price;
        ticket.paid += req.body.price;
        cashier.price += req.body.price;

        const persistedTicket = await ticket.save();
        await cashier.save();

        res
            .status(201)
            .json({
                type: 'success',
                title: 'OK',
                detail: 'Value paid successfully!',
                persistedTicket
            });
    } catch (err) {
        res.status(400).json({
            errors: [{
                type: 'error',
                title: 'ERRO',
                detail: 'The value could not be paid.',
                errorMessage: err.message,
            }, ],
        });
    }
});

router.post('/close/:id', authenticate, async (req, res) => {
    try {
        let ticket = await Ticket.findById(req.params.id);
        let cashier = await Cashier.findById(req.body.cashierId);

        await ticket.products.reduce(async (previousPromise, nextId) => {
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
        await ticket.remove();

        res
            .status(201)
            .json({
                type: 'success',
                title: 'Sucesso',
                detail: 'Ticket closed successfully!',
            });

    } catch (err) {
        res.status(400).json({
            errors: [{
                type: 'error',
                title: 'ERRO',
                detail: 'Could not add new client or table.',
                errorMessage: err.message,
            }, ],
        });
    }
});

module.exports = router;
