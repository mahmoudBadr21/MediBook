import { body } from "express-validator"
import { timeFormatRegex, timeToMinutes } from "../utils/timeFormat.js"

const availabilityValidation = () => {
  return[
    body("dayOfWeek")
      .notEmpty().withMessage("day is required")
      .isString().withMessage("day must be string")
      .isIn(["sunday", "monday", "tuesday", "wednesday", "thursday", "firday", "saturday"],)
      .withMessage("day is not right"),
    body("startTime")
      .notEmpty().withMessage("start time is required")
      .matches(timeFormatRegex)
      .withMessage("start time should be correctly formatted, EX (HH:mm) 09:00 "),
    body("endTime")
      .notEmpty().withMessage("end time is required")
      .matches(timeFormatRegex)
      .withMessage("end time should be correctly formatted, EX (HH:mm) 09:00 ")
      .custom((endTime, {req}) => {
        if (req.body.startTime && timeFormatRegex.test(req.body.startTime)) {
          const start = timeToMinutes(req.body.startTime)
          const end = timeToMinutes(endTime)

          if (end <= start) {
            throw new Error("end time shoud be before start time")
          }
        }
        return true
      }),
    body("slotDuration")
      .isInt({min: 1}).withMessage("slot duration should be integer and larger than 0")
  ]
}

export { availabilityValidation }