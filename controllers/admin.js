const Product = require("../models/product");
const fileHelper = require('../util/file');

exports.getAddProduct = (req, res, next) => {
    res.render("admin/add-product", { 
        pageTitle: "add-product", 
        isLoggedIn: req.session.isLoggedIn,
        message: '',
        oldInput: {
            title: '',
            imageUrl: '',
            price: '',
            description: ''
        } 
    });
};

exports.postAddProduct = (req, res, next) => {
    const product = new Product({
        title: req.body.title,
        price: req.body.price,
        imageUrl: '/' + req.file.path,
        description: req.body.description,
        userId: req.user
    });
    product.save()
        .then(result => {
            res.redirect("/");
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getEditProduct = (req, res, next) => {
    var productId = req.params.productId;
    Product.findById(productId)
        .then(product => {
            res.render("admin/edit-product", { 
                pageTitle: "Edit-product", 
                product: product, 
                isLoggedIn: req.session.isLoggedIn,
                message: ''
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postEditProduct = (req, res, next) => {
    const productId = req.body.productId;
    Product.findById({_id: productId})
    .then(product => {
        product.title = req.body.title,
        product.price = req.body.price;
        if(req.file){
            // used substring to prevent the file path from absolute path,
            //otherwise file path would start like 'E:\images\....'
            let filePath = product.imageUrl.substring(1);
            fileHelper.deleteFile(filePath);
            product.imageUrl = '/' + req.file.path
        }
        product.description = req.body.description;
        return product.save();
    })
    .then(result => {
        return res.redirect("/admin/products");
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

exports.deleteProduct = (req, res, next) => {
    const productId = req.params.productId;
    Product.findById(productId)
    .then(product => {
        const imagePath = product.imageUrl.substring(1);
        fileHelper.deleteFile(imagePath);
        return Product.deleteOne({ _id: productId, userId: req.session.user._id })
    })
    .then(result => {
        res.status(200).json({message: 'Deleteing successful'});
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

exports.getProducts = (req, res, next) => {
    Product.find({ userId: req.session.user._id })
        .then(products => {
            res.render("admin/products", { pageTitle: "Admin Products", products: products, isLoggedIn: req.session.isLoggedIn });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};