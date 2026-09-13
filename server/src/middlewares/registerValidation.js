import { body } from "express-validator"

const registerValidation = () => {
  return [
    body("firstName")
      .notEmpty()
      .withMessage("First name is required")
      .isLength({min: 2})
      .withMessage("First name at least is 2 digits")
      .isAlpha("en-US", {ignore: " "})
      .withMessage("Allow english caracter"),

      body("lastName")
      .notEmpty()
      .withMessage("Last name is required")
      .isLength({min: 2})
      .withMessage("Last name at least is 2 digits")
      .isAlpha("en-US", {ignore: " "})
      .withMessage("Allow english caracter"),

      body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Enter correct email"),

      body("phone")
      .notEmpty()
      .withMessage("phone is required")
      .isMobilePhone("any")
      .withMessage("Enter correct phone number"),
  ]
}

export { registerValidation }