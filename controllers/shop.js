const Product = require("../models/product");
const User = require("../models/user");
const Order = require("../models/order");
const path = require('path');
const PDFDocument = require('pdfkit');
const fs = require('fs');

const PRODUCTS_PER_PAGE = 2;

exports.getIndex = (req, res, next) => {
    const page = req.query.page || 1;
    const skipProds = (page - 1) * PRODUCTS_PER_PAGE;
    let totalProducts;
    Product.countDocuments()
    .then(numProds => {
        totalProducts = numProds;
        return Product.find().skip(skipProds).limit(PRODUCTS_PER_PAGE)   
    })
    .then(products => {
        const totalPages = Math.ceil(totalProducts/PRODUCTS_PER_PAGE);
        const pagination = { currentPage: +page, lastPage: +totalPages };
        res.render("shop/index", { pageTitle: "index", products: products, isLoggedIn: req.session.isLoggedIn, pagination: pagination });
    })
    .catch(err => next(err)); 
};

exports.getAllProducts = (req, res, next) => {
    const page = req.query.page || 1;
    const skipProds = (page - 1) * PRODUCTS_PER_PAGE;
    let totalProducts;
    Product.countDocuments()
    .then(numProds => {
        totalProducts = numProds;
        return Product.find().skip(skipProds).limit(PRODUCTS_PER_PAGE)   
    })
    .then(products => {
        const totalPages = Math.ceil(totalProducts/PRODUCTS_PER_PAGE);
        const pagination = { currentPage: +page, lastPage: +totalPages };
        res.render("shop/index", { pageTitle: "products", products: products, isLoggedIn: req.session.isLoggedIn, pagination: pagination });
    })
    .catch(err => next(err)); 
};

exports.postOrders = (req, res, next) => {
    User.findById(req.user._id).populate('cart.productId').exec((err, user) => {
        user.addToOrder(user.cart);
        res.redirect("/cart");
    });
};

exports.getOrders = (req, res, next) => {
    Order.find({ userId: req.user }).then(orders => {
        res.render("shop/orders", { pageTitle: "orders", orders: orders, isLoggedIn: req.session.isLoggedIn });
    });
};

exports.getCheckout = (req, res, next) => {
    res.render("shop/checkout", { pageTitle: "checkout", isLoggedIn: req.session.isLoggedIn });
};

exports.getProductDetails = (req, res, next) => {
    const productId = req.params.productId;
    Product.findById(productId)
        .then(product => {
            res.render("shop/product-detail", { pageTitle: "Product Detail", product: product, isLoggedIn: req.session.isLoggedIn });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postAddToCart = (req, res, next) => {
    productId = req.body.productId;
    User.findById(req.user._id).then(user => {
        user.addToCart(productId);
    })
        .then(() => res.redirect("/"))
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getCart = (req, res, next) => {
    User.findById(req.user._id).populate('cart.productId').exec((err, user) => {
        res.render("shop/cart", { pageTitle: "cart", products: user.cart, isLoggedIn: req.session.isLoggedIn });
    });
};

exports.removeFromCart = (req, res, next) => {
    const productId = req.body.productId;
    User.findById(req.user._id).then(user => {
        user.removeFromCart(productId);
    })
        .then(() => res.redirect("/cart"))
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    Order.findById(orderId)
        .then(order => {
            if (order.userId.toString() !== req.session.user._id.toString()) {
                return next(new Error('Unauthorized'));
            }
            const invoiceName = 'invoice-' + orderId.toString() + '.pdf';
            const invoicePath = path.join('data', 'invoices', invoiceName);

            const doc = new PDFDocument();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
            doc.pipe(fs.createWriteStream(invoicePath));
            doc.pipe(res);

            doc.fontSize(26).text('Invoice', {
                underline: true
            });
            doc.text('----------------------');
            let totalPrice = 0;
            order.products.forEach(prod => {
                doc.fontSize(14).text(prod.product.title + ' - ' + prod.quantity + ' X ' + prod.product.price);
            });
            doc.text('-----');
            doc.fontSize(20).text('Total Price: $' + order.totalPrice);
            doc.end();
        })
        .catch(err => next(err));
}