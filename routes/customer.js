const express = require('express');
const { body } = require('express-validator');
const customerController = require('../controller/customer')
const authController = require('../controller/auth')
const Customer = require('../models/customer');
const Account = require('../models/account')
const router = express.Router();
const isAuth = require('../middleware/is-auth');


router.post('/signup', [
        body('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .custom(async(value, { req }) => {
            return Customer.findOne({ email: value }).then(userDoc => {
                if (userDoc) {
                    return Promise.reject('E-mail address already exists! ')
                }
            })
        }),
        body('password').trim().isLength({ min: 3 }),
        body('username').trim().not().isEmpty(),
        body('phone_no').trim().not().isEmpty(),
        body('address').trim().not().isEmpty()
    ],
    authController.Customer_signup);


router.post('/Login', [
    body('email')
    .isEmail()
    .withMessage('Please enter a valid email.'),
    body('password').trim().isLength({ min: 3 })
], authController.login);

router.get('/getDetails', isAuth('Customer'), customerController.getDetails);

router.post('/createDetails', isAuth('Customer'), customerController.createAccount);

router.post('/tranferamount', isAuth('Customer'), customerController.amountTransfer);

router.post('/loanrequest', isAuth('Customer'), customerController.loanrequest);

router.get('/transactions', isAuth('Customer'), customerController.transactionDetails);

router.get('/loanDetails/:id', isAuth('Customer'), customerController.loanDetails);

router.get('/getAllAccounts', isAuth('Customer'), customerController.getAllAccounts);


module.exports = router;