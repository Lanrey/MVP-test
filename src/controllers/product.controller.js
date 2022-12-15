const catchAsync = require("../helpers/catchAsync");
const { productService } = require("../services");
const ApiError = require("../helpers/ApiError");
const pick = require("../helpers/pick");

const createProduct = catchAsync(async function (req, res) {
  const product = await productService.createProduct({
    ...req.body,
    sellerId: req.user._id,
  });
  res.status(201).send({
    message: "Product created successfully",
    data: {
      product,
    },
  });
});

const editProduct = catchAsync(async function (req, res) {
  const product = await productService.updateProduct(req.params._id, req.body);

  res.status(200).send({
    message: "Product updated successfully",
    data: {
      product,
    },
  });
});

const list = catchAsync(async function (req, res) {
  const filter = { isDeleted: false };
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const { product, page } = await productService.fetchAll(filter, options);
  const count = await productService.count(filter);
  res.status(200).send({
    status: "success",
    message: "Product Fetched successfully",
    data: {
      count,
      currentPage: page,
      product,
    },
  });
});

const listOne = catchAsync(async function (req, res) {
  const product = await productService.findOne({
    _id: req.params._id,
    isDeleted: false,
  });
  if (!product) {
    throw new ApiError(404, "Product not found");
  }
  res.status(200).send({
    status: "success",
    message: "Product fetched Successfully",
    data: {
      product,
    },
  });
});

const deleteProduct = catchAsync(async function (req, res) {
  const product = await productService.deleteProduct(req.params._id);

  res.status(200).send({
    message: "Product deleted successfully",
    data: {
      product,
    },
  });
});

const buyProduct = catchAsync(async function (req, res) {
  const { product, change, totalAmount } = await productService.buyProduct(
    req.body,
    req.user._id
  );

  res.status(200).send({
    message: "Product purchased successfully",
    data: {
      product,
      totalAmount,
      change,
    },
  });
});

module.exports = {
  createProduct,
  editProduct,
  list,
  deleteProduct,
  listOne,
  buyProduct,
};
