//MIDDLEWARE 

const { Book } = require('../models/book.model');

async function checkLoanRules(req, res, next) {
  try {
    const id = req.params.id;
    const isbn = req.params.isbn;

    let book = null;
    if (id) book = await Book.findById(id);
    else if (isbn) book = await Book.findOne({ isbn: String(isbn).toUpperCase() });

    if (!book) return res.status(404).json({ statusCode: 404, message: 'Libro no encontrado' });

    if (book.condition === 'poor') {
      return res.status(409).json({ statusCode: 409, message: 'No se puede prestar un libro en estado "poor"' });
    }
    next();
  } catch (e) {
    return res.status(500).json({ statusCode: 500, message: e?.message || 'Error en reglas de préstamo' });
  }
}

module.exports = { checkLoanRules };