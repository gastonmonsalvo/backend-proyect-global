// Asegura Content-Type JSON en POST/PUT/PATCH
//MIDDLEWARE 

function requireJson(req, res, next) {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const ct = req.headers['content-type'] || '';
    if (!ct.includes('application/json')) {
      return res.status(415).json({ statusCode: 415, message: 'Content-Type debe ser application/json' });
    }
  }
  next();
}

module.exports = requireJson;