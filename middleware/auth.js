const jwt = require('jsonwebtoken');
const User = require("../models/user")

const auth = (req, res, next) => {
  const token = req.header('x-auth-token');

  // Check for token
  if (!token)
  {
    return res.status(401).json({ message: 'No token, authorizaton denied' });
  }
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Add user from payload
    User.findOne({token:token},function (err, user) {
        if (err){
            console.log(err)
        }

        else{
            if(user===undefined){
                return console.log("Token is invalid")
            }
            console.log(user)
            decoded.role=user.role
            req.user = decoded;
            // console.log(req.user)
             next();
        }}
        );
    // console.log(role.token)
    
  } catch (error) {
    res.status(400).json({ message: error.message,
        message: 'Token is not valid' });
  }
};

module.exports = auth;