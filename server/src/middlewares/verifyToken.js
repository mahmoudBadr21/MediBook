import jwt from 'jsonwebtoken'
import { AppError } from "../utils/appError.js"
import { ERROR } from '../utils/httpSatutsText.js'

const verifyToken = (req, res, next) => {
  const token = req.cookies.token
  if (!token) {
    const error = new AppError("token is required", 401, ERROR)
    return next(error)
  }

  try {
    const currentUser = jwt.verify(token, process.env.JWT_SECRET_KEY)
    req.currentUser = currentUser
    next()
  } catch {
    const error = new AppError("invalid token", 401, ERROR)
    return next(error)
  }
}

export { verifyToken }