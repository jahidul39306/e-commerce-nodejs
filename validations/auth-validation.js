const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const User = require('../models/user');

exports.signupValidation = [
    body('email', 'Invalid email').isEmail(),
    body('password', 'Password must be 5 characters long and alphanumeric').isLength({ min: 5 }).isAlphanumeric().trim(),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password');
        }
        return true;
    })
    .trim(),
    body('email').custom((value) => {
        return User.findOne({email: value})
        .then(user => {
            if(user){
                return Promise.reject('Email already taken, please take another email');
            }
        })
    })
    .normalizeEmail(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).render('auth/signup', {
                pageTitle: 'signup',
                isLoggedIn: req.session.isLoggedIn,
                message: errors.array()[0].msg,
                oldInput: {
                    email: req.body.email,
                    password: req.body.password,
                    confirmPassword: req.body.confirmPassword
                }
            });
        }
        next();
    }
];

exports.loginValidation = [
    body('email'),
    body('password')
]