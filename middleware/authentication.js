const CustomError = require('../errors');
const { isTokenValid ,attachCookiesToResponse} = require('../utils');
const Token = require('../models/Token')

const authenticateUser = async (req, res, next) => {

  const {refreshToken, accessToken} = req.signedCookies;

  try {
    if(accessToken){
      const payload = isTokenValid(accessToken)
      req.user = payload
      return next() // return next() vs next() . Return next moves to next middleware immediately vs
      //next moves to the another middleware but executes the code after next if any
    }
    const payload = isTokenValid(refreshToken)

    const existingToken = await Token.findOne({
      user : payload.user.userId,
      refreshToken : payload.refreshToken
    })
    if(!existingToken || !existingToken?.isValid){
      throw new CustomError.UnauthenticatedError('Authentication Invalid');
    }
    attachCookiesToResponse({
      res,
      user : payload.user,
      refreshToken : existingToken.refreshToken
    })
    req.user = payload.user
    next()
  } catch (error) {
    throw new CustomError.UnauthenticatedError('Authentication Invalid');
  }
};

const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnauthorizedError(
        'Unauthorized to access this route'
      );
    }
    next();
  };
};

module.exports = {
  authenticateUser,
  authorizePermissions,
};
