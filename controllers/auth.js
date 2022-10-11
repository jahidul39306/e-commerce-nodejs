require('dotenv').config();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.sendinblue.com',
    port: 587,
    auth: {
        user: process.env.SEND_IN_BLUE_USER,
        pass: process.env.SEND_IN_BLUE_PASS
    }
}
);

exports.getLogIn = (req, res, next) => {
    res.render('auth/login', { 
        pageTitle: 'login', 
        isLoggedIn: req.session.isLoggedIn, 
        message: req.flash('error'),
        oldInput: {
            email: '',
            password: ''
        }
    });
};


exports.postLogIn = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                req.flash('error', 'Wrong credential');
                return res.render('auth/login', { 
                    pageTitle: 'login', 
                    isLoggedIn: req.session.isLoggedIn, 
                    message: req.flash('error') ,
                    oldInput: {
                        email: req.body.email,
                        password: req.body.password
                    }
                });
            }
            bcrypt.compare(req.body.password, user.password)
                .then(result => {
                    
                    if (result) {
                        req.session.user = user;
                        req.session.isLoggedIn = true;
                        req.session.save();
                        return res.redirect('/');
                    }
                    req.flash('error', 'Wrong credential');
                    return res.render('auth/login', { 
                        pageTitle: 'login', 
                        isLoggedIn: req.session.isLoggedIn, 
                        message: req.flash('error') ,
                        oldInput: {
                            email: req.body.email,
                            password: req.body.password
                        }
                    });
                })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
    });
};

exports.postLogOut = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    });
};

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        pageTitle: 'signup',
        isLoggedIn: req.session.isLoggedIn,
        message: req.flash('error'),
        oldInput: {
            email: '',
            password: '',
            confirmPassword: ''
        }
    });
}

exports.postSignup = (req, res, next) => {
    bcrypt.hash(req.body.password, 12)
    .then(hash => {
        const password = hash;
        return password;
    })
    .then(password => {
        const user = new User({
            email: req.body.email,
            password: password,
            cart: []
        });
        return user;
    })
    .then(user => {
        user.save();
        res.redirect('/login');
        return transporter.sendMail({
            from: "node-shop@blue.com",
            to: req.body.email,
            subject: 'Signup successful',
            html: 'You are successfully signed up'
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

exports.getReset = (req, res, next) => {
    res.render('auth/reset-pass', { pageTitle: 'Reset password', isLoggedIn: req.session.isLoggedIn, message: req.flash('error') });
};

exports.postReset = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                req.flash('error', 'No account with that email found.');
                return res.redirect('/reset');
            }
            return user;
        })
        .then(user => {
            crypto.randomBytes(32, (err, buffer) => {
                if (err) {
                    console.log(err);
                    req.flash('error', 'Something went wrong please try again later');
                    return res.redirect('/reset');
                }
                const token = buffer.toString('hex');
                user.resetToken = token;
                user.resetTokenExpirationDate = Date.now() + 3600000;
                user.save();
                transporter.sendMail({
                    to: req.body.email,
                    from: "node-shop@blue.com",
                    subject: 'password reset',
                    html: `
                        <p>You requested a password reset</p>
                        <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
                    `
                });
                res.redirect('/');
            })
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.getNewPass = (req, res, next) => {
    // res.render('auth/new-pass');
    const token = req.params.token;
    User.findOne({ resetToken: token, resetTokenExpirationDate: { $gt: Date.now() } })
        .then(user => {
            res.render('auth/new-pass', {
                pageTitle: 'New password',
                userId: user._id.toString(),
                isLoggedIn: req.session.isLoggedIn,
                message: req.flash('error')
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.postNewPass = (req, res, next) => {
    User.findOne({ _id: req.body.userId })
        .then(user => {
            bcrypt.hash(req.body.password, 12)
                .then(hash => {
                    user.password = hash;
                    user.resetToken = undefined;
                    user.resetTokenExpirationDate = undefined;
                    return user.save();
                })
        })
        .then(result => res.redirect('/login'))
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}