const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({
    accountNumber: { type: Number, required: true, unique: true },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
    },
    balance: { type: Number, minimum: 0, required: true, default: 0 },
    transactions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
    }, ],
    loans: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Loan",
    }, ],
});

module.exports = mongoose.model("Account", accountSchema);