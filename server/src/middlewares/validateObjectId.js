import mongoose from 'mongoose'
import { AppError } from '../utils/appError.js';
import { FAIL } from '../utils/httpSatutsText.js';

const validateObjectId = (paramName = "id") => {
  return (req, res, next) => {
    const id = req.params[paramName];

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new AppError(`Invalid Mongo ObjectId: ${id}`, 400, FAIL);
      return next(error);
    }

    next();
  };
};

export { validateObjectId }