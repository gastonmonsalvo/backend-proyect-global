const mongoose = require("mongoose");

const LoanSchema = require("./loan.model");

const BookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    isbn: { type: String, required: true, unique: true, uppercase: true },
    year: { type: Number, min: 1400, max: 2100, required: true },
    condition: {
      type: String,
      enum: ["new", "good", "fair", "poor"],
      required: true,
    },
    location: { type: String, default: "Sala A" },
    tags: [{ type: String, trim: true }],
    isLoaned: { type: Boolean, default: false },
    currentLoan: { type: LoanSchema },
    loanHistory: { type: [LoanSchema], default: [] },
  },
  { timestamps: true }
);
const Book = mongoose.model("Book", BookSchema);

module.exports = {
  Book,
};
