const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require("dotenv").config();
const auth = require('../middleware/auth');

// User Model
const User = require('../models/user');

// @route   POST api/users
// @desc    Register new user
// @access  Public
router.post('/signup', (req, res) => {
  const { name, email, password, role } = req.body;

  // Simple validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  // Check for existing user
  User.findOne({ email }).then(user => {
    if (user) return res.status(400).json({ message: 'User already exists' });

    const newUser = new User({
      name,
      email,
      password,
      role
    });

    // Create salt & hash
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        newUser.password = hash;
        newUser.save().then(user => {
          jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: 3600 },
            (err, token) => {
              if (err) throw err;
              res.json({
                message:"User Created Successfully",
                user: {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  role: user.role
                }
              });
            }
          );
        });
      });
    });
  });
});
//login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      message: "Please enter email and password to login"
    });
  }

  try {
    let existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({
        message: "User with this email does not exist"
      });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Incorrect password"
      });
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET);
    existingUser.token = token;
    await existingUser.save((error, user) => {
              if (error) {
                res.status(400).json({ message: 'Something went wrong' });
              } else {
                  return res.status(200).json({
                    message: "User logged in successfully",
                    token,
                    existingUser
    });
              }
            });

  } catch (err) {
    return res.status(500).json({
      message: err.message
    });
  }
});


//get users list if logged in as admin
router.get('/list', auth, (req, res) => {
  // console.log(req.user)
  if (req.user.role !== 'admin') {
    return res.status(400).json({ message: 'You are not authorized to access this page' });
  }
  User.find()
    .sort({ date: -1 })
    .then(users => res.json(users));
});

module.exports = router;