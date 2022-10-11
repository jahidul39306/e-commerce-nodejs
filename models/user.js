const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Order = require('./order');

const userSchema = new Schema({
	email: {
        type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	resetToken : String,
	resetTokenExpirationDate: Date,
	cart: [
		{
			productId: {
				type: Schema.Types.ObjectId,
				ref: 'Product',
				required: true
			},
			quantity: {
				type: Number,
				required: true
			}
		}
	]
});

userSchema.methods.addToCart = function (productId) {
	let tempCart = this.cart;
	const productIndex = tempCart.findIndex(p => p.productId.toString() === productId.toString());
	if (productIndex >= 0) {
		tempCart[productIndex].quantity = tempCart[productIndex].quantity + 1;
	} else {
		tempCart.push({ productId: productId, quantity: 1 });
	}
	this.cart = tempCart;
	this.save();
};

userSchema.methods.removeFromCart = function (productId) {
	let tempCart = this.cart.filter(p => p.productId.toString() !== productId.toString());
	this.cart = tempCart;
	this.save();
};

userSchema.methods.addToOrder = function (cart) {
	let products = [];
	let totalPrice = 0;
	cart.forEach(product => {
		products.push({
			product: {
				title: product.productId.title,
				price: product.productId.price,
				imageUrl: product.productId.imageUrl,
				description: product.productId.description
			},
			quantity: product.quantity
		});
		totalPrice = totalPrice + product.productId.price * product.quantity;
	});
	const order = new Order({
		products: products,
		totalPrice: totalPrice,
		userId: this._id
	});
	order.save();
	this.clearCart();
};

userSchema.methods.clearCart = function () {
	this.cart = [];
	this.save();
}

module.exports = mongoose.model('User', userSchema);

// const User = sequelize.define('User', {
//     id: {
//         type: Sequelize.INTEGER,
//         allowNull: false,
//         primaryKey: true,
//         autoIncrement: true
//     },
//     name: Sequelize.STRING,
//     email: Sequelize.STRING
// });

// module.exports = User;