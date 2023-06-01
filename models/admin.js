const mongoose = require("mongoose");
const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: {
        type: String,
        required: true,
        enum: ["Admin"],
        default: "Admin"
    },
    email: { type: String, required: true },
    password: { type: String, required: true },
    maxLoanAmount: { type: Number, required: true, default: 100000 },
});

module.exports = mongoose.model("Admin", adminSchema);