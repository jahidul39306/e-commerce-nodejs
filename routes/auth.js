const express = require('express');

const router = express.Router();

const authConroller = require('../controllers/auth');

const authValidation = require('../validations/auth-validation');

const { body, validationResult } = require('express-validator');

router.get('/login', authConroller.getLogIn);

router.post('/login', authConroller.postLogIn);

router.post('/logout', authConroller.postLogOut);

router.get('/signup', authConroller.getSignup);

router.post('/signup', authValidation.signupValidation, authConroller.postSignup);

router.get('/reset', authConroller.getReset);

router.post('/reset', authConroller.postReset);

router.get('/reset/:token', authConroller.getNewPass);

router.post('/new-pass', authConroller.postNewPass);

module.exports = router;