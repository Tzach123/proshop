import asyncHandler from 'express-async-handler'
import User from '../models/userModel.js'
import generateToken from '../util/generateToken.js'

//@des  Auth user & get token
//@route  POST /api/users/login
//@access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email })

  if (user && (await user.matchPassword(password))) {
    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    })
  } else {
    res.status(401)
    throw new Error('Invalid email or password')
  }
})

//@des  Register a new user
//@route  POST /api/users
//@access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  const userExist = await User.findOne({ email })

  if (userExist) {
    res.status(400)
    throw new Error('User alresdy exists')
  } else {
    const user = await User.create({
      name,
      email,
      password,
      createAt: Date.now(),
      updateAt: Date.now(),
    })

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      })
    } else {
      res.status(400)
      throw new Error('Invalid status data')
    }
  }
})

//@des  Get user profile
//@route  POST /api/users/profile
//@access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (user) {
    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    })
  } else {
    res.status(404)
    throw Error('User not found')
  }
})

//@des  Update user profile
//@route  PUT /api/users/profile
//@access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (user) {
    user.name = req.body.name || user.name
    user.email = req.body.email || user.email
    if (req.body.password) {
      user.password = req.body.password
    }
    const updateUser = await user.save()

    return res.json({
      _id: updateUser._id,
      name: updateUser.name,
      email: updateUser.email,
      isAdmin: updateUser.isAdmin,
      token: generateToken(updateUser._id),
    })
  } else {
    res.status(404)
    throw Error('User not found')
  }
})

//@des  Get all users
//@route  GET /api/users
//@access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({})
  res.send(users)
})

//@des  Delete user
//@route  DELETE /api/users/:id
//@access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (user) {
    await user.remove()
    res.send({ message: 'User remove' })
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

//@des  Get user by id
//@route  GET /api/users/:id
//@access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password')

  if (user) {
    res.send(user)
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

//@des  Update user
//@route  PUT /api/users/:id
//@access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (user) {
    user.name = req.body.name || user.name
    user.email = req.body.email || user.email
    user.isAdmin = req.body.isAdmin || user.isAdmin
    user.updateAt = Date.now()

    const updateUser = await user.save()

    return res.json({
      _id: updateUser._id,
      name: updateUser.name,
      email: updateUser.email,
      isAdmin: updateUser.isAdmin,
    })
  } else {
    res.status(404)
    throw Error('User not found')
  }
})

export {
  authUser,
  getUserProfile,
  registerUser,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
}
