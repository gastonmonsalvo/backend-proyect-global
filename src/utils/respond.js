function respond(res, result, fallback = 200) {
  const status = result?.statusCode ?? fallback;
  const body = result?.data ?? (result?.message ? { message: result.message } : {});
  return res.status(status).json(body);
};
module.exports = respond;
