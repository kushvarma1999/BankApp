const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs')
const Admin = require('../models/admin')
const Customer = require('../models/customer')
const jwt = require('jsonwebtoken')
const path = require('path');
require('dotenv').config();

const secretKey = process.env.TOKEN_SECRET_KEY;

exports.Admin_signup = async(req, res, next) => {

    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    const maxLoanAmount = 1000000;
    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed.');
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        }

        const hashedPW = await bcrypt
            .hash(password, 12)

        const admin = new Admin({
            email: email,
            password: hashedPW,
            name: name,
            maxLoanAmount: maxLoanAmount
        });
        await admin.save();

        res.status(201).json({
            message: "Admin created Sucessfully!",

        });
    } catch (err) {
        if (!err.statuCode) {
            err.statuCode = 500;
        }
        next(err);
    };
}

exports.login = async(req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let user;
    let loadedUser;
    try {
        if (req.baseUrl == '/bank/admin') {
            user = await Admin.findOne({ email: email });
        } else {
            user = await Customer.findOne({ email: email });
        }
        if (!user) {
            const error = new Error('A User with email could not be found');
            error.statuCode = 401;
            throw error;
        }
        loadedUser = user;
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            const error = new Error('Wrong password');
            error.statusCode = 401;
            throw error;
        }
        // Create a JWT token with the user's role
        const token = jwt.sign({
            email: loadedUser.email,
            userId: loadedUser._id.toString(),
            role: loadedUser.role
        }, secretKey, { expiresIn: '1h' });
        res.status(200)
            .json({
                message: "Login sucessful",
                token: token,
                userId: loadedUser._id.toString(),
                role: loadedUser.role
            });
    } catch (err) {
        if (!err.statuCode) {
            err.statuCode = 500;
        }
        console.log(err);
        next(err);
    }
};
exports.Customer_signup = async(req, res, next) => {
    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed.');
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        }
        let userToCreate = {

            username: req.body.username,
            email: req.body.email,
            phone_no: req.body.phone_no,
            address: req.body.address,
            password: req.body.password
        }
        const userExistsAlready = await Customer.find({ email: userToCreate.email })
        console.log(userExistsAlready);
        if (userExistsAlready.length > 0) {
            return res.status(401).json({ msg: 'E-mail already exist' })
        }
        const hashedPw = await bcrypt
            .hash(userToCreate.password, 12)


        const user = new Customer({
            email: userToCreate.email,
            password: hashedPw,
            username: userToCreate.username,
            address: userToCreate.address,
            phone_no: userToCreate.phone_no,

        });
        await user.save();


        res.status(201).json({
            message: 'User created!',
        })
    } catch (err) {
        if (!err.statuCode) {
            err.statuCode = 500;
        }
        next(err);
    };

}