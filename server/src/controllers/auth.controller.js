import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import User from "../models/user.model.js";
import { AppError } from "../utils/appError.js";
import { asyncWrapper } from "../utils/asyncWrapper.js";
import { SUCCESS, FAIL } from "../utils/httpSatutsText.js";
import { genarateJWT } from '../utils/genarateJWT.js'

const getAllUsers = asyncWrapper(async (req, res) => {
  const users = User.find({}, {"__v": false, "password": false})
  return res.json({status: SUCCESS, data: {data}})
})

const register = asyncWrapper(async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const messages = errors.array().map(err => err.msg).join(', ')
    const error = new AppError(messages, 400, FAIL)
    return next(error)
  }
  const {firstName, lastName, email, password, phone, role, avatar} = req.body

  const oldUser = await User.findOne({email: email})
  if (oldUser) {
    const error = new AppError("user already exists", 400, FAIL)
    return next(error)
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const fileName = req.file ? req.file.filename : "profile.png"

  const newUser = new User({
    firstName,
    lastName,
    email,
    role,
    password : hashedPassword,
    phone,
    avatar: fileName
  })

  const token = await genarateJWT({
    id: newUser._id,
    firstName: newUser.firstName,
    lastName: newUser.lastName,
    email: newUser.email,
    phone: newUser.phone,
    role: newUser.role,
    avatar: newUser.avatar
  })

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax"
  })
  await newUser.save()
  return res.status(201).json({
    status: SUCCESS,
    data: {
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
      },
    },
  });
})

const login = asyncWrapper(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(err => err.msg).join(', ')
    const error = new AppError(messages, 400, FAIL);
    return next(error);
  }

  const { email, password } = req.body;

  if (!email || !password) {
    const error = new AppError("email and password is required", 400, FAIL);
    return next(error);
  }

  const user = await User.findOne({ email: email });
  if (!user) {
    const error = new AppError("user not found", 404, FAIL);
    return next(error);
  }

  const matchPassword = await bcrypt.compare(password, user.password);
  if (!matchPassword) {
    const error = new AppError("password is failed", 400, FAIL);
    return next(error);
  }

  if (user && matchPassword) {
    const token = await genarateJWT({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.status(200).json({
      status: SUCCESS,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
      },
    });
  }
});

const logout = asyncWrapper(async (req, res) => {
  res.clearCookie("token")
  res.status(200).json({status: SUCCESS})
})

const getMe = asyncWrapper(async (req, res) => {
  res.status(200).json({status: SUCCESS, data: req.currentUser})
})

export {
  getAllUsers,
  register,
  login,
  logout,
  getMe
}