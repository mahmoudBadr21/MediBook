import { FAIL, ERROR } from '../utils/httpSatutsText.js'
class AppError extends Error {
  constructor(message, statusCode, statusText) {
    super(message);
    
    this.statusCode = statusCode;
    this.statusText = statusText
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export { AppError };