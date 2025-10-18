// Middleware to handle asynchronous route handlers and forward errors to Express
// so a single, central error handler can send the response. This avoids sending
// headers from multiple places (which causes ERR_HTTP_HEADERS_SENT).
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    // Forward the error to the next Express error-handling middleware
    next(error);
  });
};

export default asyncHandler;
