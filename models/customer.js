const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: ["Customer"],
        default: "Customer"
    },
    phone_no: {
        type: Number,
        required: true,
        unique: true
    },
    address: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true,
    }

}, { timestamps: true });


module.exports = mongoose.model("Customer", customerSchema);