/**
 * Global error handler - catches errors and returns consistent JSON
 */
export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors || err.message,
    });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Duplicate entry',
      details: 'A record with this value already exists',
    });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Maximum size is 2MB.' });
  }
  if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: 'Invalid file upload.' });
  }
  if (err.message?.includes('Only PNG') || err.message?.includes('images are allowed')) {
    return res.status(400).json({ error: err.message });
  }

  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
  });
}
