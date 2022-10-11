const express = require("express");
const isAuth = require('../middleware/is-authenticated');

const router = express.Router();

const shopController = require("../controllers/shop");

router.get("/", shopController.getIndex);

router.get("/products", shopController.getAllProducts);

router.get("/cart", isAuth, shopController.getCart);

router.post("/add-to-cart", isAuth, shopController.postAddToCart);

router.post("/cart-delete-item", isAuth, shopController.removeFromCart);

router.post("/create-order", isAuth, shopController.postOrders);

router.get("/orders", isAuth, shopController.getOrders);

// router.get("/checkout", shopController.getCheckout);

router.get("/product-details/:productId", isAuth, shopController.getProductDetails);

router.get('/get-invoice/:orderId', isAuth, shopController.getInvoice);

module.exports = router;