const express = require("express");
const {
  getAllBooksController,
  getBookByIdController,
  addBookController,
  updateBookController,
  deleteBookController,
  loanBookController,
  returnBookController,
  getBookByIsbnController,
  updateBookByIsbnController,
  loanBookByIsbnController,
  returnBookByIsbnController,
  deleteBookByIsbnController,
  searchBooksUnifiedController,
} = require("../controllers/books.controllers");

const { checkLoanRules } = require("../utils/checkLoanRules");
const { idParam, createBook, updateBook, loanPayload, isbnParam } = require('../validators/book.validators');
const { booksSearchValidators } = require('../validators/googleBookSearch.validator');
const handleValidation = require('../utils/handleValidation');
const bookRouter = express.Router();

// GOOGLE - BUSQUEDA UNIFICADA
bookRouter.get('/search',booksSearchValidators,handleValidation, searchBooksUnifiedController); 

// CRUD por ISBN 
bookRouter.get('/isbn/:isbn', isbnParam, getBookByIsbnController);
bookRouter.put('/isbn/:isbn', isbnParam, updateBook, updateBookByIsbnController);
bookRouter.delete('/isbn/:isbn', isbnParam, deleteBookByIsbnController); 

// Préstamos por ISBN
bookRouter.post('/isbn/:isbn/loan', isbnParam, loanPayload, checkLoanRules, loanBookByIsbnController);
bookRouter.post('/isbn/:isbn/return', isbnParam, returnBookByIsbnController);

// CRUD por ID (MongoId)
bookRouter.get("/", getAllBooksController);
bookRouter.get("/:id", idParam, getBookByIdController);
bookRouter.post("/", createBook, addBookController);
bookRouter.put("/:id", idParam, updateBook, updateBookController);
bookRouter.delete("/:id", idParam, deleteBookController);

// Préstamos por ID (MongoId)
bookRouter.post("/:id/loan", idParam, loanPayload, checkLoanRules, loanBookController);
bookRouter.post("/:id/return", idParam, returnBookController);

module.exports = bookRouter;
