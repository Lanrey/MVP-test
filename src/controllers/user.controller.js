const catchAsync = require("../helpers/catchAsync");
const { userService } = require("../services");
const ApiError = require("../helpers/ApiError");
const pick = require("../helpers/pick");

const createUser = catchAsync(async function (req, res) {
  const user = await userService.register(req.body);
  res.status(201).send({
    message: "User created successfully",
    data: {
      user,
    },
  });
});

const login = catchAsync(async function (req, res) {
  const user = await userService.login(req.body);
  res.status(201).send({
    message: "User login  successfully",
    data: {
      user,
    },
  });
});

const editUser = catchAsync(async function (req, res) {
  const user = await userService.updateUser(req.user._id, req.body);

  res.status(200).send({
    message: "User updated successfully",
    data: {
      user,
    },
  });
});

const userDeposit = catchAsync(async function (req, res) {
  const userData = await userService.findOne({ _id: req.user._id });
  const newPrice = parseInt(userData.deposit) + parseInt(req.body.amount);

  const user = await userService.updateUser(req.user._id, {
    deposit: newPrice,
  });

  res.status(200).send({
    message: "User updated successfully",
    data: {
      user,
    },
  });
});

const userReset = catchAsync(async function (req, res) {
  const user = await userService.updateUser(req.user._id, {
    deposit: 0,
  });

  res.status(200).send({
    message: "User reset successfully",
    data: {
      user,
    },
  });
});

const userLogout = catchAsync(async function (req, res) {
  const user = await userService.updateUser(req.user._id, {
    token: null,
  });

  res.status(200).send({
    message: "User Logout successfully",
    data: {
      user,
    },
  });
});

const list = catchAsync(async function (req, res) {
  const filter = { isDeleted: false };
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const { user, page } = await userService.fetchAll(filter, options);
  const count = await userService.count(filter);
  res.status(200).send({
    status: "success",
    message: "User Fetched successfully",
    data: {
      count,
      currentPage: page,
      user,
    },
  });
});

const listOne = catchAsync(async function (req, res) {
  const user = await userService.findOne({
    _id: req.params._id,
    isDeleted: false,
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  res.status(200).send({
    status: "success",
    message: "User fetched Successfully",
    data: {
      user,
    },
  });
});

const deleteUser = catchAsync(async function (req, res) {
  await userService.deleteUser(req.user._id);

  res.status(200).send({
    message: "User deleted successfully",
    data: {},
  });
});

module.exports = {
  createUser,
  editUser,
  list,
  deleteUser,
  listOne,
  login,
  userDeposit,
  userReset,
  userLogout,
};
