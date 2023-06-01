const Admin = require("../models/admin");
require("dotenv").config();
const Customer = require("../models/customer");
const Loan = require("../models/loan");
const Transaction = require("../models/transaction");
const ObjectId = require("mongodb").ObjectId;
const mongoose = require('mongoose');
const Account = require('../models/account')
    //It will fetch all customer details from Customer
exports.getCustomerDetails = async(req, res) => {
    try {
        const details = await Customer.find();
        if (!details) {
            return res.status(404).send("Customer not found");
        }
        res.status(200).json(details);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

//calculate total amount of all customer
exports.totalAmount = async(req, res) => {
    try {
        let total = 0;
        const allaccount = await Account.find();
        if (!allaccount) {
            return res.status(404).send("There is no account.");
        }
        for (let i = 0; i < allaccount.length; i++) {
            total += details[i].balance;
        }
        res.status(200).send({ total });
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
};

//Fetch all loan request from loan table.
exports.loanrequest = async(req, res) => {
    try {
        const loanDetails = await Loan.find();
        if (!loanDetails) {
            return res.status(404).send("There is no loans applied.");
        }
        res.status(200).send(loanDetails);
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
};

exports.loanRequestHandler = async(req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {

        const { accountid: accountId, loanid: loanId, status: isApproved } = req.body;

        if (!accountId || !loanId || !isApproved) {
            return res.status(400).send("Missing required fields");
        }

        const account = await Account.findById(accountId, null, { session });
        if (!account) {
            return res.status(404).send("Account not found");
        }

        const customer = await Customer.findById(account.customer, null, { session });
        if (!customer) {
            return res.status(404).send("Customer not found");
        }

        const loan = await Loan.findById(loanId, null, { session });
        if (!loan) {
            return res.status(404).send("Loan not found");
        }

        const accountNumber = 99999999999
        const bankAccount = await Account.findOne({ accountNumber }, null, { session });
        console.log(req.userId);
        if (!bankAccount) {
            return res.status(404).send("Bank Account not found");
        }
        const approved = "approved"
        if (isApproved === approved) {
            const newAccountBalance = account.balance + loan.amount;
            const newBankBalance = bankAccount.balance - loan.amount;
            const receiveTransaction = new Transaction({
                customer: account.customer,
                type: "loanCredit",
                AccountNumber: account.accountNumber,
                amount: loan.amount,
                date: Date.now(),
            });
            await receiveTransaction.save({ session });

            const sendTransaction = new Transaction({
                customer: bankAccount.customer,
                type: "loanDebit",
                AccountNumber: bankAccount.accountNumber,
                amount: loan.amount,
                date: Date.now(),
            });
            await sendTransaction.save({ session });


            const accountUpdate = await Account.updateOne({ _id: accountId }, { $set: { balance: newAccountBalance, }, $push: { loans: loanId, transactions: receiveTransaction._id } }, { session });
            const bankAccountUpdate = await Account.updateOne({ _id: bankAccount._id }, { $set: { balance: newBankBalance, }, $push: { loans: loanId, transactions: sendTransaction._id } }, { session });
            if (accountUpdate.modifiedCount !== 1 || bankAccountUpdate.modifiedCount != 1) {
                await session.abortTransaction();
                session.endSession();
                return res.status(500).send("Failed to update account Balance and should be aborted.");
            }
            const startDate = Date.now()
            const endDate = startDate + loan.period;

            const updatedLoan = await Loan.updateOne({ _id: loanId }, {
                status: isApproved,
                admin: req.userId,
                startDate,
                endDate
            }, { session });

            if (updatedLoan.modifiedCount !== 1) {
                await session.abortTransaction();
                session.endSession();
                return res.status(500).send("Failed to update loan status  and should be aborted.");
            }

            await session.commitTransaction();
            session.endSession();
            return res.send("Loan approved");
        } else {
            const updatedLoan = await Loan.updateOne({ _id: loanId }, {
                status: isApproved,
            }, { session });
            if (updatedLoan.modifiedCount !== 1) {
                await session.abortTransaction();
                session.endSession();
                return res.status(500).send("Failed to update loan status");
            }
            await session.commitTransaction();
            session.endSession();
            return res.send("Loan rejected");
        }
    } catch (error) {
        console.error(error);
        await session.abortTransaction();
        session.endSession();
        res.status(500).send("Internal Server Error");
    }
};

exports.setMaxLoanAmount = async(req, res) => {
    try {
        const { amount } = req.body;
        const update = { maxLoanAmount: amount };
        const admin = await Admin.updateOne({}, update);
        console.log(admin);
        if (!admin) {
            return res.status(404).send("Admin document not found.");
        }
        res.send("Successfully updated maxLoanAmount.");
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal server error.");
    }
};

exports.getAllTransaction = async(req, res) => {
    try {
        const transactions = await Transaction.find();
        if (!transactions) {
            return res.status(404).send("There is no Transactions happen till.");
        }
        res.send(transactions);
    } catch (err) {
        res.send(err);
    }
};


// exports.bankAccount = async(req, res)=>{
//     function generateAccountNumber() {
//         const num = Math.floor(Math.random() * 1000000000000);
//         return num;
//     }
//     const accountNumber = generateAccountNumber();
//     const account = new Account({
//         accountNumber,
//         admin:req.userId
//     })

//     await account.save();
//     res.send("Account generated.")
// }