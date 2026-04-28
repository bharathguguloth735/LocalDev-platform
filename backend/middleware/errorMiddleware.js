/**
 * Centralized Error Normalization Middleware
 * Ensures all API responses follow a professional, high-fidelity format.
 */
const errorMiddleware = (err, req, res, next) => {
    console.error(`[Neural Link Error] sector: ${req.path}`, err);

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    res.status(statusCode).json({
        success: false,
        status: 'error',
        code: statusCode,
        message: err.message || 'Internal System Protocol Failure',
        stack: process.env.NODE_ENV === 'production' ? 'Locked' : err.stack,
        timestamp: new Date().toISOString(),
        path: req.path
    });
};

export default errorMiddleware;
