const { body, validationResult } = require('express-validator');
const Product = require("../models/product");


exports.addProductValidation = [
    body('title', 'Title is empty').notEmpty(),
    body('price', 'Price can be only numeric value').isNumeric().notEmpty(),
    body('description', 'Description can not be empty').notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).render("admin/add-product", {
                pageTitle: "add-product",
                isLoggedIn: req.session.isLoggedIn,
                message: errors.array()[0].msg,
                oldInput: {
                    title: req.body.title,
                    price: req.body.price,
                    description: req.body.description
                },
            });
        }
        if (!req.file) {
            return res.status(422).render("admin/add-product", {
                pageTitle: "add-product",
                isLoggedIn: req.session.isLoggedIn,
                message: 'Image is not given',
                oldInput: {
                    title: req.body.title,
                    price: req.body.price,
                    description: req.body.description
                },
            });
        }
        next();
    }
];

exports.editProductValidation = [
    body('title', 'Title can not be empty').notEmpty(),
    body('price', 'Price can be only numeric value').isNumeric().notEmpty(),
    body('description', 'Description can not be empty').notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var productId = req.body.productId;
            Product.findById(productId)
                .then(product => {
                    return res.status(422).render("admin/edit-product", {
                        pageTitle: "Edit-product",
                        isLoggedIn: req.session.isLoggedIn,
                        message: errors.array()[0].msg,
                        product: {
                            _id: req.body.productId,
                            title: req.body.title,
                            price: req.body.price,
                            description: req.body.description
                        },
                    });
                })
                .catch(err => next(err));
        } else {
            next();
        }
    }
];