//MIDDLEWARE 

const { validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  return res.status(400).json({
    message: 'Validación fallida',
    errors: errors.array().map(e => ({
      field: e.param,
      msg: e.msg,
      value: e.value,
    })),
  });
};

module.exports =  handleValidation ;