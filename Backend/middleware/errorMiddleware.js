function notFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(error, _req, res, _next) {
  console.error(error);
  if (res.headersSent) return;

  const status = Number(error.status) || 500;
  res.status(status).json({
    error: status >= 500 ? 'Internal server error.' : error.message
  });
}

module.exports = { notFound, errorHandler };
