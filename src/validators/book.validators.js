//MIDDLEWARE 

const { body, param, validationResult } = require('express-validator');

const validate = (request, response, next) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(400).json({
      statusCode: 400,
      message: "Errores de validación",
      errors: errors.array().map(err => ({
        campo: err.path,
        valor: err.value,
        error: err.msg
      }))
    });
  }
  next();
};

const idParam = [
  param('id')
    .isMongoId()
    .withMessage('El ID proporcionado no es válido'),
  validate,
];

const createBook = [
  body('title')
    .isString().withMessage('El título debe ser texto')
    .trim()
    .notEmpty().withMessage('El título es obligatorio'),
  body('author')
    .isString().withMessage('El autor debe ser texto')
    .trim()
    .notEmpty().withMessage('El autor es obligatorio'),
  body('isbn')
    .isString().withMessage('El ISBN debe ser texto')
    .trim()
    .isLength({ min: 10 }).withMessage('El ISBN debe tener al menos 10 caracteres'),
  body('year')
    .optional()
    .isInt({ min: 0, max: new Date().getFullYear() })
    .withMessage(`El año debe ser un número entre 0 y ${new Date().getFullYear()}`),
  body('condition')
    .optional()
    .isIn(['new', 'good', 'fair', 'poor'])
    .withMessage("La condición debe ser 'new', 'good', 'fair' o 'poor'"),
  validate,
];

const updateBook = [
  body('title').optional().isString().withMessage('El título debe ser texto'),
  body('author').optional().isString().withMessage('El autor debe ser texto'),
  body('isbn').optional().isString().isLength({ min: 10 }).withMessage('El ISBN debe tener al menos 10 caracteres'),
  body('year').optional().isInt({ min: 0, max: new Date().getFullYear() })
    .withMessage(`El año debe ser un número entre 0 y ${new Date().getFullYear()}`),
  body('condition').optional().isIn(['new', 'good', 'fair', 'poor'])
    .withMessage("La condición debe ser 'new', 'good', 'fair' o 'poor'"),
  validate,
];

const loanPayload = [
  body('borrowerName')
    .isString().withMessage('El nombre del prestatario debe ser texto')
    .trim()
    .notEmpty().withMessage('El nombre del prestatario es obligatorio'),
  body('desiredDate')
    .optional()
    .isISO8601().withMessage('La fecha debe tener formato válido (YYYY-MM-DD)'),
  validate,
];


const isbnParam = [
  param('isbn')
    .isString().withMessage('El ISBN debe ser texto')
    .trim()
    .isLength({ min: 10 }).withMessage('El ISBN debe tener al menos 10 caracteres'),
  validate,
];

module.exports = { idParam, createBook, updateBook, loanPayload, isbnParam };
