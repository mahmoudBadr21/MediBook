import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import User from "../models/user.model.js";
import { AppError } from "../utils/appError.js";
import { asyncWrapper } from "../utils/asyncWrapper.js";
import { SUCCESS, FAIL } from "../utils/httpSatutsText.js";
import { genarateJWT } from '../utils/genarateJWT.js'

const getAllUsers = asyncWrapper(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const totalUsers = await User.countDocuments();

  const users = await User.find({}, { "__v": false, "password": false })
    .limit(limit)
    .skip(skip);

  return res.status(200).json({
    status: SUCCESS,
    data: {
      totalUsers,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      limit,
      users
    }
  });
});

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

const changePassword = asyncWrapper(async (req, res, next) => {
  const {id, currentPass, newPass, confirmNewPass} = req.body
  const user = await User.findOne({_id: id})
  if (!user) {
    const error = AppError.create("user not found", 404, FAIL)
    return next(error)
  }

  const matchPassword = await bcrypt.compare(currentPass, user.password)
  if (!matchPassword) {
    const error = AppError.create("current password is incorrect", 400, FAIL)
    return next(error)
  }

  if (newPass !== confirmNewPass) {
    const error = AppError.create("password is not identical", 400, FAIL)
    return next(error)
  }

  const isSamePassword = await bcrypt.compare(newPass, user.password)
  if (isSamePassword) {
    const error = AppError.create("new password must be different", 400, FAIL)
    return next(error)
  }

  const hashedNewPassword = await bcrypt.hash(newPass, 10)
  user.password = hashedNewPassword

  await user.save()
  res.status(200).json({ status: SUCCESS, user });
})

const updateRole = asyncWrapper(async (req, res, next) => {
  const { email, role } = req.body;
  if (!email || !role) {
    const error = AppError.create("email and role is required", 400, FAIL)
    return next(error)
  }

  const user = await User.findOne({email: email})
  if (!user) {
    const error = AppError.create("user not found", 404, FAIL)
    return next(error)
  }

  const lastRole = user.role
  if (role === lastRole) {
    const error = AppError.create(`this user is already ${lastRole}`, 400, FAIL)
    return next(error)
  }

  user.role = role
  await user.save()
  res.status(200).json({ status: "success", user });
})

export {
  getAllUsers,
  register,
  login,
  logout,
  getMe,
  changePassword,
  updateRole
}