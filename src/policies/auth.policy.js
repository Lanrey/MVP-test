const ApiError = require("../helpers/ApiError");
const jwt = require("jsonwebtoken");

const validateToken = function (req, res, next) {
  const bearerHeader = req.headers.authorization;
  if (!bearerHeader) {
    throw new ApiError(401, "Authentication required");
  }

  const bearer = bearerHeader.split(" ");
  const [, token] = bearer;
  req.token = token;
  jwt.verify(req.token, process.env.JWT_SECRET, (err, authData) => {
    if (err) {
      throw new ApiError(401, "Authentication required");
    } else {
      req.user = authData.user; // Add User Id to request
      next();
    }
  });
};

const isSeller = function (req, res, next) {
  if (req.user.role === "seller") {
    next();
  } else {
    throw new ApiError(
      401,
      "You need to be a seller to perform this transaction"
    );
  }
};

const isBuyer = function (req, res, next) {
  if (req.user.role === "buyer") {
    next();
  } else {
    throw new ApiError(
      401,
      "You need to be a buyer to perform this transaction"
    );
  }
};

const isProductOwner = function (req, res, next) {
  if (req.user._id !== req.params._id) {
    next();
  } else {
    throw new ApiError(
      401,
      "You need to be the owner of this product to perform this operation"
    );
  }
};

module.exports = {
  validateToken,
  isBuyer,
  isSeller,
  isProductOwner,
};
