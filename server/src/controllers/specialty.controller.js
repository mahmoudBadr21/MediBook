import Specialty from "../models/specialty.model.js";
import { AppError } from "../utils/appError.js";
import { asyncWrapper } from "../utils/asyncWrapper.js";
import { FAIL, SUCCESS } from "../utils/httpSatutsText.js";

const getAllSpecialty = asyncWrapper (async (req, res) => {
  const courses = await Specialty.find({}, {"__v": false})
  return res.json({status: SUCCESS, data:{courses}})
})

const getSpecialty = asyncWrapper(async (req, res, next) => {
  const specialty = await Specialty.findById(req.params.specialtyId)
  if (!specialty) {
    const error = new AppError("This specialty not found", 404, FAIL)
    return next(error)
  }

  return res.json({status: SUCCESS, data: {specialty}})
})

const addSpecialty = asyncWrapper(async (req, res) => {
  const {name, description, img} = req.body
  const newSpecialty = new Specialty({
    name,
    description,
    img
  })
  await newSpecialty.save()
  return res.status(201).json({status: SUCCESS, data: {newSpecialty}})
})

const deleteSpecialty = asyncWrapper(async (req, res, next) => {
  const specialty = await Specialty.findByIdAndDelete(req.params.specialtyId)
  if (!specialty) {
    const error = new AppError("This specialty not found", 404, FAIL)
    return next(error)
  }
  return res.status(200).json({status: SUCCESS, data: null})
})

const updateSpecialty = asyncWrapper(async (req, res, next) => {
  const {specialtyId} = req.params
  const specialty = await Specialty.findByIdAndUpdate(specialtyId, {$set: {...req.body}}, {returnDocument: 'after', runValidators: true})
  if (!specialty) {
    const error = new AppError("This specialty not found", 404, FAIL)
    return next(error)
  }
  return res.status(200).json({status: SUCCESS, data: {specialty}})
})

export {
  getAllSpecialty,
  getSpecialty,
  addSpecialty,
  deleteSpecialty,
  updateSpecialty
}