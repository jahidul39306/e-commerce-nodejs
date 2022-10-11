require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const path = require('path');
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const multiPartFormHandler = require('./middleware/multiPartFormHandler');

const MONGODB_URI = process.env.MONGODB_URI;

const app = express();

const store = new MongoDBStore({
	uri: MONGODB_URI,
	collection: 'sessions'
});

const csrfProtection = csrf();

const User = require('./models/user');

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multiPartFormHandler);
// app.use(multer({dest: 'images'}).single('imageUrl'));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(session({
	secret: 'my secret',
	resave: false,
	saveUninitialized: false,
	store: store
}));

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
	res.locals.csrfToken = req.csrfToken();
	next();
});

app.use((req, res, next) => {
	if (!req.session.user) {
		return next();
	}
	User.findById(req.session.user._id)
		.then(user => {
			req.user = user;
			next();
		})
		.catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use((req, res, next) => {
	res.status(404).render("404", { 
		pageTitle: "Page Not Found", 
		isLoggedIn: req.session.isLoggedIn 
	});
});

app.use((error, req, res, next) => {
	res.status(500).render('500', {
		pageTitle: 'Error!',
		isLoggedIn: req.session.isLoggedIn
	})
});

mongoose.connect(MONGODB_URI)
	.then(result => {
		User.findOne().then(user => {
			if (!user) {
				user = new User({ name: 'jahid', email: 'test@test.com', cart: [] });
				user.save();
			}
		});
		console.log('connected');
		app.listen(process.env.PORT);
	})
	.catch(err => next(err));


