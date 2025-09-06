// Middleware
function logger(request, response, next) {
  console.log(
    `${new Date().toISOString()} ${request.method} ${request.originalUrl}`
  );
  next();
}
module.exports = logger;