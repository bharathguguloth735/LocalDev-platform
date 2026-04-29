import winston from 'winston';

const { combine, timestamp, printf, colorize, json } = winston.format;

const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const isProduction = process.env.NODE_ENV === 'production';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    isProduction ? json() : combine(colorize(), timestamp({ format: 'HH:mm:ss' }), consoleFormat)
  ),
  defaultMeta: { service: 'localdev-connect-api' },
  transports: [
    // Console transport works in all environments including Vercel serverless
    new winston.transports.Console(),

    // File transports ONLY in local development (Vercel filesystem is read-only)
    ...(isProduction ? [] : [
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        maxsize: 5242880,
        maxFiles: 5,
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
        maxsize: 5242880,
        maxFiles: 5,
      }),
    ])
  ],
});

export default logger;
