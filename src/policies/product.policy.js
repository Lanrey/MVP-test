const Joi = require("@hapi/joi");
const mongoIdPattern = /^[0-9a-fA-F]{24}$/;

const create = {
  body: Joi.object().keys({
    productName: Joi.string().required().messages({
      "string.empty": `Product Name cannot be an empty field`,
      "any.required": `Product Name is a required field`,
      "any.pattern": `Product Name can only contain alphabets, numbers, dashes and underscores`,
    }),
    cost: Joi.number().required().messages({
      "any.empty": `Cost cannot be an empty field`,
      "any.required": `Cost is a required field`,
    }),
    amountAvailable: Joi.number().required().messages({
      "any.empty": `Amount Available cannot be an empty field`,
      "any.required": `Amount Available is a required field`,
    }),
  }),
};

const buy = {
  body: Joi.object().keys({
    productId: Joi.string().required().pattern(mongoIdPattern).messages({
      "string.empty": `Product ID cannot be an empty field`,
      "any.required": `Product ID is a required field`,
      "any.pattern": `Product ID must be a valid ID`,
    }),
    amountOfProducts: Joi.number().required().messages({
      "any.empty": `Amount of product cannot be an empty field`,
      "any.required": `Amount of product is a required field`,
    }),
  }),
};

const get = {
  params: Joi.object().keys({
    _id: Joi.string().pattern(mongoIdPattern).required().messages({
      "string.empty": `Medication ID Must be passed cannot be an empty field`,
      "any.required": `Medication ID is a required field`,
      "string.pattern": `Medication ID must be a valid Mongo ID`,
    }),
  }),
};

module.exports = {
  create,
  get,
  buy,
};
