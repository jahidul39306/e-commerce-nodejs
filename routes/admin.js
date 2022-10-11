const express = require("express");
const isAuth = require('../middleware/is-authenticated');
const productValidation = require('../validations/product-validation');

// const path = require("path");

const router = express.Router();

const adminController = require("../controllers/admin");

router.get("/add-product", isAuth, adminController.getAddProduct);

router.post("/add-product", isAuth, productValidation.addProductValidation, adminController.postAddProduct);

router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

router.post("/edit-product", isAuth, productValidation.editProductValidation, adminController.postEditProduct);

router.delete("/delete-product/:productId", isAuth, adminController.deleteProduct);

router.get("/products", isAuth, adminController.getProducts);



module.exports = router;