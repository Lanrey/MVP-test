const express = require("express");
const validate = require("../helpers/validate");

const { productController } = require("../controllers");
const { productValidation, authValidation } = require("../policies");

const router = express.Router();
router.get("/all", productController.list);

router.post(
  "/",
  [authValidation.validateToken, validate(productValidation.create)],
  productController.createProduct
);

router.post(
  "/buy",
  [authValidation.validateToken, validate(productValidation.buy)],
  productController.buyProduct
);

router.put(
  "/:_id",
  [
    authValidation.validateToken,
    validate(productValidation.get),
    authValidation.isProductOwner,
  ],
  productController.editProduct
);

router.delete(
  "/:_id",
  [
    authValidation.validateToken,
    validate(productValidation.get),
    authValidation.isProductOwner,
  ],
  productController.deleteProduct
);

router.get(
  "/:_id",
  [validate(productValidation.get)],
  productController.listOne
);

module.exports = router;
