// Global Express error handler
// Must have 4 parameters for Express to recognize it as error middleware
const errorHandler = (err, req, res, _next) => {
    console.error('❌ Server error:', err.message);
    console.error(err.stack);
  
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';
  
    res.status(statusCode).json({
      error: true,
      message,
      code: statusCode
    });
  };
  
  module.exports = errorHandler;
  