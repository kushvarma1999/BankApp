const express = require('express');
const { body } = require('express-validator');
const adminController = require('../controller/admin')
const authController = require('../controller/auth')
const router = express.Router();
const isAuth = require('../middleware/is-auth');
const Admin = require('../models/admin');

router.post('/signup', [
    body('email')
    .isEmail()
    .withMessage('Please enter a valid email.')
    .custom((value, { req }) => {
        return Admin.findOne({ email: value }).then(userDoc => {
            if (userDoc) {
                return Promise.reject('E-mail address already exists! ')
            }
        })
    })
    .normalizeEmail(),
    body('password').trim().isLength({ min: 3 }),
    body('name').trim().not().isEmpty()
], authController.Admin_signup);

router.post('/login', [
    body('email')
    .isEmail()
    .withMessage('Please enter a valid email.')
    .custom((value, { req }) => {
        return Admin.findOne({ email: value }).then(userDoc => {
            if (userDoc) {
                return Promise.reject('E-mail address already exists! ')
            }
        })
    }),
    body('password').trim().isLength({ min: 3 })
], authController.login);

router.get('/getCustomerDetails', isAuth('Admin'), adminController.getCustomerDetails);

router.get('/total', isAuth('Admin'), adminController.totalAmount);

router.get('/loanRequest', isAuth('Admin'), adminController.loanrequest);

router.post('/isApproved', isAuth('Admin'), adminController.loanRequestHandler);

router.post('/setMaxLoanAmount', [body('amount').isNumeric().withMessage('Amount must be numeric')], isAuth('Admin'), adminController.setMaxLoanAmount);

router.get('/allTransactions', isAuth('Admin'), adminController.getAllTransaction);

// router.post('/bankMainAccount',isAuth('Admin'), adminController.bankAccount);

module.exports = router;