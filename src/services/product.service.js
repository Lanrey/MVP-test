const { Product } = require("../models");
const userService = require("./user.service");
const ApiError = require("../helpers/ApiError");

const createProduct = async (data) => {
  try {
    if (data.cost % 5 !== 0) {
      throw new ApiError(400, "Product cost must be in Multiples of 5");
    }
    const product = await Product.create(data);
    return JSON.parse(JSON.stringify(product));
  } catch (error) {
    throw new ApiError(
      error.code || error.statusCode || 500,
      error.message || error
    );
  }
};

const findOne = async (criteria) => {
  try {
    const product = await Product.findOne({ ...criteria });
    if (!product || product.isDeleted) {
      throw new ApiError(404, "Product not found");
    }
    return JSON.parse(JSON.stringify(product));
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

  let product = await Product.find(criteria)
    .sort(sort)
    .limit(_limit)
    .skip(_limit * (_page - 1));

  return { product, page: _page };
};

const count = async (criteria = {}) => {
  return await Product.find(criteria).countDocuments();
};

const updateProduct = async (id, data) => {
  let product = await Product.findById(id);

  if (!product || product.isDeleted) {
    throw new ApiError(404, "Product not found");
  }

  if (data.cost && data.cost % 5 !== 0) {
    throw new ApiError(400, "Product cost must be in Multiples of 5");
  }

  Object.assign(product, data);

  await product.save();
  return product;
};

const deleteProduct = async (id) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  Object.assign(product, { isDeleted: true });
  await product.save();
  return product;
};

const buyProduct = async (data, userId) => {
  try {
    const { productId, amountOfProducts } = data;
    const product = await findOne({ _id: productId });
    const user = await userService.findOne({ _id: userId });
    const { deposit } = user;

    if (!product || product.isDeleted) {
      throw new ApiError(404, "Product not found");
    }

    if (product.amountAvailable < amountOfProducts) {
      throw new ApiError(
        400,
        "Product Quantity not enough for this transaction"
      );
    }
    const totalAmount = product.cost * amountOfProducts;

    if (deposit < totalAmount) {
      throw new ApiError(400, "Insufficient funds");
    }
    const productBalance = product.amountAvailable - amountOfProducts;
    const depositBalance = user.deposit - totalAmount;
    const updatedProduct = await updateProduct(productId, {
      amountAvailable: productBalance,
    });
    await userService.updateUser(user._id, { deposit: depositBalance });
    const change = await calculateChange(depositBalance);
    return JSON.parse(
      JSON.stringify({ product: updatedProduct, totalAmount, change })
    );
  } catch (error) {
    throw new ApiError(
      error.code || error.statusCode || 500,
      error.message || error
    );
  }
};

const calculateChange = async (balance) => {
  try {
    const hundreds = Math.floor(balance / 100);
    const fiftys = Math.floor((balance % 100) / 50);
    const twentys = Math.floor(((balance % 100) - fiftys * 50) / 20);
    const tens = Math.floor((((balance % 100) - fiftys * 50) % 20) / 10);
    const fives = Math.floor(((((balance % 100) - fiftys * 50) % 20) % 10) / 5);
    return [fives, tens, twentys, fiftys, hundreds];
  } catch (error) {
    throw new ApiError(
      error.code || error.statusCode || 500,
      error.message || error
    );
  }
};

module.exports = {
  createProduct,
  findOne,
  fetchAll,
  count,
  updateProduct,
  deleteProduct,
  buyProduct,
};
