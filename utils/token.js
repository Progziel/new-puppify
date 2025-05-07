const jwt = require('jsonwebtoken');
const { secretKey, expiresIn } = require('../config/jwt');

const generateToken = (user) => {
    return jwt.sign({
        id: user.id,
      },
      secretKey,
      { expiresIn }
    );
  };

    //Refresh Token
    const generateRefreshToken = (userId) => {
      return jwt.sign({ 
        userId 
      
      }, secretKey, { expiresIn: '7d' }); 
    };

  //Reset Token
  const generateResetToken = (userId) => {
    return jwt.sign({ userId }, secretKey, { expiresIn: '1h' }); 
  };


module.exports = {
generateToken,
generateRefreshToken,    
generateResetToken
  }