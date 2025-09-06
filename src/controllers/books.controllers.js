const respond = require('../utils/respond');
const {
  getAllBooksService,
  getBookByIdService,
  getBookByIsbnService,
  addBookService,
  updateBookService,
  deleteBookService,
  loanBookService,
  returnBookService,
  updateBookByIsbnService,
  loanBookByIsbnService,
  returnBookByIsbnService,
  deleteBookByIsbnService,
  searchBooksUnifiedService
} = require('../services/books.services');


// GET all
const getAllBooksController = async (_req, res) => {
  const result = await getAllBooksService();
  return respond(res, result, 200);
};

// GET by ID (MongoId)
const getBookByIdController = async (req, res) => {
  const result = await getBookByIdService(req.params.id);
  return respond(res, result, 200);
};

// GET by ISBN (BD)
const getBookByIsbnController = async (req, res) => {
  const result = await getBookByIsbnService(req.params.isbn);
  return respond(res, result, 200);
};

// POST create
const addBookController = async (req, res) => {
  const result = await addBookService(req.body);
  return respond(res, result, 201);
};

// PUT update
const updateBookController = async (req, res) => {
  const result = await updateBookService(req.params.id, req.body);
  return respond(res, result, 200);
};

// PUT por ISBN
const updateBookByIsbnController = async (req, res) => {
  const result = await updateBookByIsbnService(req.params.isbn, req.body);
  return respond(res, result, 200);
};

// DELETE
const deleteBookController = async (req, res) => {
  const result = await deleteBookService(req.params.id);
  return respond(res, result, 200);
};
// DELETE por ISBN
const deleteBookByIsbnController = async (req, res) => {
  const result = await deleteBookByIsbnService(req.params.isbn);
  return respond(res, result, 200);
};

// POST loan
const loanBookController = async (req, res) => {
  const result = await loanBookService(req.params.id, req.body);
  return respond(res, result, 200);
};

// POST loan por ISBN
const loanBookByIsbnController = async (req, res) => {
  const result = await loanBookByIsbnService(req.params.isbn, req.body);
  return respond(res, result, 200);
};

// POST return por ISBN
const returnBookByIsbnController = async (req, res) => {
  const result = await returnBookByIsbnService(req.params.isbn);
  return respond(res, result, 200);
};

// POST return
const returnBookController = async (req, res) => {
  const result = await returnBookService(req.params.id);
  return respond(res, result, 200);
};



// GET /api/books/search?q=...&isbn=...&maxResults=...&includeLocal=1&onlyLocal=1&onlyMissing=1
const searchBooksUnifiedController = async (req, res) => {
  const { q, isbn, maxResults, includeLocal, onlyLocal, onlyMissing } = req.query || {};
  const result = await searchBooksUnifiedService({ q, isbn, maxResults, includeLocal, onlyLocal, onlyMissing });
  return respond(res, result);
};

module.exports = {
  getAllBooksController,
  getBookByIdController,
  getBookByIsbnController,
  addBookController,
  updateBookController,
  deleteBookController,
  loanBookController,
  returnBookController,
  updateBookByIsbnController,
  loanBookByIsbnController,
  returnBookByIsbnController,
  deleteBookByIsbnController,
  searchBooksUnifiedController

};
