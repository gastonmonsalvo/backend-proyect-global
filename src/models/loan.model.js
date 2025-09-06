const mongoose = require("mongoose");

const LoanSchema = new mongoose.Schema(
  {
    borrowerName: { type: String, required: true, trim: true },
    loanDate: { type: Date, default: Date.now },
    returnDate: { type: Date },
  },
  { _id: false } // No genera un _id separado para cada préstamo
);

module.exports = LoanSchema;