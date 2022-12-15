const { User } = require("../models");
const ApiError = require("../helpers/ApiError");
const jwt = require("jsonwebtoken");
const moment = require("moment");

const register = async (data) => {
  try {
    if (data.userName && (await User.isUserNameTaken(data.userName, null))) {
      throw new ApiError(400, "Username already taken");
    }
    const user = await User.create(data);
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    throw new ApiError(
      error.code || error.statusCode || 500,
      error.message || error
    );
  }
};

const login = async (data) => {
  try {
    const { userName, password } = data;
    const user = await User.findOne({ userName, isDeleted: false }).select(
      "+password"
    );
    if (!user || !(await User.isPasswordMatch(password, user.password))) {
      throw new ApiError(400, "Invalid username or password");
    }
    console.log("jjj");
    if (user && user.token) {
      throw new ApiError(
        400,
        "Please logout on all systems before you can login here"
      );
    }
    const token = await generateToken(user);
    const updatedUser = await updateUser(user._id, { token });
    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    throw new ApiError(
      error.code || error.statusCode || 500,
      error.message || error
    );
  }
};

const findOne = async (criteria) => {
  try {
    const user = await User.findOne({ ...criteria });
    if (!user || user.isDeleted) {
      throw new ApiError(404, "User not found");
    }
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    throw new ApiError(
      error.code || error.statusCode || 500,
      error.message || error
    );
  }
};

const fetchAll = async (criteria = {}, options = {}) => {
  const { sort = { createdAt: -1 }, limit, page } = options;

  const _limit = parseInt(limit, 10);
  const _page = parseInt(page, 10);

  let users = await Users.find(criteria)
    .sort(sort)
    .limit(_limit)
    .skip(_limit * (_page - 1));

  return { users, page: _page };
};

const count = async (criteria = {}) => {
  return await User.find(criteria).countDocuments();
};

const updateUser = async (id, data) => {
  let user = await User.findById(id);
  if (!user || user.isDeleted) {
    throw new ApiError(404, "User not found");
  }
  Object.assign(user, data);
  await user.save();
  return user;
};

const deleteUser = async (id) => {
  const user = await User.findById(id);
  if (!user || user.isDeleted) {
    throw new ApiError(404, "User not found");
  }

  Object.assign(user, { isDeleted: true });
  await user.save();
  return user;
};

const generateToken = (user) => {
  const payload = {
    user,
    iat: moment().unix(),
  };
  return jwt.sign(payload, process.env.JWT_SECRET);
};

module.exports = {
  register,
  findOne,
  fetchAll,
  count,
  updateUser,
  deleteUser,
  generateToken,
  login,
};
