import { body } from "express-validator"

const loginValidation = () => {
  return [
    body("email")
      .notEmpty().withMessage("Email is required")
      .isEmail().withMessage("Enter correct email"),
    body("password")
      .notEmpty().withMessage("Email is required")
  ]
}

export { loginValidation }