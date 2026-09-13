import { body } from "express-validator"
import { timeFormatRegex, timeToMinutes } from "../utils/timeFormat.js"

const updateAvailabilityValidation = () => {
  return[
    body("dayOfWeek")
      .optional()
      .isString().withMessage("day must be string")
      .isIn(["sunday", "monday", "tuesday", "wednesday", "thursday", "firday", "saturday"],)
      .withMessage("day is not right"),
    body("startTime")
      .optional()
      .matches(timeFormatRegex)
      .withMessage("start time should be correctly formatted, EX (HH:mm) 09:00 "),
    body("endTime")
      .optional()
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
      })
  ]
}

export { updateAvailabilityValidation }