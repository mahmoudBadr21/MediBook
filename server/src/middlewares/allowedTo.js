import { AppError } from "../utils/appError.js"
import { FAIL } from "../utils/httpSatutsText.js"

const allowedTo = (...roles) => {
  return (req, res, next) => {
    if(!roles.includes(req.currentUser.role)) {
      console.log(req.currentUser);
      console.log("role",req.currentUser.role);
      
      const error = new AppError("this role is not authoraized", 401, FAIL)
      return next(error)
    }
    next()
  }
}

export { allowedTo }