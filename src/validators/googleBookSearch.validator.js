const { query } = require('express-validator');

const isbnRegex = /^[0-9Xx\- ]{9,17}$/; // len amplia + guiones/espacios
const toBool = v => (String(v).toLowerCase() === '1' || String(v).toLowerCase() === 'true');

const booksSearchValidators = [
  // q e isbn son opcionales, pero al menos uno debe estar
  query('q').optional().isString().trim().isLength({ min: 1 }).withMessage('q debe ser texto'),
  query('isbn').optional().matches(isbnRegex).withMessage('isbn debe ser 10/13, con o sin guiones'),

  // maxResults con default server-side; aquí validamos rango
  query('maxResults')
    .optional()
    .toInt()
    .isInt({ min: 1, max: 40 })
    .withMessage('maxResults debe ser un entero entre 1 y 40'),

  // booleans flexibles
  query('includeLocal').optional().customSanitizer(toBool).isBoolean().withMessage('includeLocal inválido'),
  query('onlyLocal').optional().customSanitizer(toBool).isBoolean().withMessage('onlyLocal inválido'),
  query('onlyMissing').optional().customSanitizer(toBool).isBoolean().withMessage('onlyMissing inválido'),

  // Regla: q o isbn (al menos uno)
  query(['q', 'isbn']).custom((_, { req }) => {
    if (!req.query.q && !req.query.isbn) throw new Error('Debes enviar una consulta (query) o ISBN');
    return true;
  }),

  // Regla: onlyLocal y onlyMissing no pueden coexistir
  query('onlyLocal').custom((val, { req }) => {
    if (val && toBool(req.query.onlyMissing)) throw new Error('onlyLocal y onlyMissing son excluyentes');
    return true;
  }),
];

module.exports = { booksSearchValidators };